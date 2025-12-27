const { Application, Student, Position, Teacher, User, Notification, Internship, Enterprise } = require('../models');
const { successResponse, errorResponse, validationErrorResponse, notFoundErrorResponse, businessErrorResponse } = require('../utils/response');
const { sequelize } = require('../config/database');
const operationLogService = require('../services/operationLogService');

/**
 * Submit an internship application
 * POST /api/applications
 * Validates Requirements 4.1, 4.4
 */
const submitApplication = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { position_id, personal_statement, contact_info } = req.body;
    const userId = req.user.id;

    // Validate required fields (Requirement 4.4)
    const errors = [];
    if (!position_id) {
      errors.push({ field: 'position_id', message: '岗位ID不能为空' });
    }
    if (!personal_statement || personal_statement.trim() === '') {
      errors.push({ field: 'personal_statement', message: '个人简介不能为空' });
    }
    if (!contact_info || contact_info.trim() === '') {
      errors.push({ field: 'contact_info', message: '联系方式不能为空' });
    }

    if (errors.length > 0) {
      await transaction.rollback();
      return res.status(400).json(validationErrorResponse(errors));
    }

    // Get student record
    const student = await Student.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json(notFoundErrorResponse('学生信息'));
    }

    // Check if position exists
    const position = await Position.findByPk(position_id, { transaction });
    if (!position) {
      await transaction.rollback();
      return res.status(404).json(notFoundErrorResponse('实习岗位'));
    }

    // Check for duplicate applications (Requirement 4.2)
    const existingApplication = await Application.findOne({
      where: {
        student_id: student.id,
        status: ['pending', 'approved']
      },
      transaction
    });

    if (existingApplication) {
      await transaction.rollback();
      return res.status(409).json(
        businessErrorResponse('DUPLICATE_APPLICATION', '您已经有待审批或已通过的申请，不能重复申请')
      );
    }

    // Check if position has available slots (Requirement 4.3)
    if (position.available_slots <= 0) {
      await transaction.rollback();
      return res.status(409).json(
        businessErrorResponse('POSITION_FULL', '该岗位名额已满，无法申请')
      );
    }

    // Create application record (Requirement 4.1)
    const application = await Application.create({
      student_id: student.id,
      position_id: position_id,
      personal_statement: personal_statement.trim(),
      contact_info: contact_info.trim(),
      status: 'pending',
      applied_at: new Date()
    }, { transaction });

    // Get all teachers to notify (Requirement 4.5, 9.2)
    const teachers = await Teacher.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id']
      }],
      transaction
    });

    // Create notifications for teachers
    const notificationPromises = teachers.map(teacher => 
      Notification.create({
        user_id: teacher.user.id,
        title: '新的实习申请待审批',
        content: `学生已提交实习申请，岗位：${position.title}`,
        type: 'application_submitted',
        is_read: false,
        created_at: new Date()
      }, { transaction })
    );

    await Promise.all(notificationPromises);

    await transaction.commit();

    // Log application submission
    await operationLogService.logApplicationSubmission(userId, application.id, position_id, req);

    // Return created application with related data
    const createdApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'real_name', 'email']
          }]
        },
        {
          model: Position,
          as: 'Position',
          attributes: ['id', 'title', 'description', 'start_date', 'end_date']
        }
      ]
    });

    return res.status(201).json(successResponse(createdApplication, '申请提交成功'));

  } catch (error) {
    await transaction.rollback();
    console.error('Submit application error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Get application list
 * GET /api/applications
 */
const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, page = 1, limit = 10, keyword } = req.query;

    let whereClause = {};
    let includeClause = [
      {
        model: Student,
        as: 'Student',
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'real_name', 'email']
        }]
      },
      {
        model: Position,
        as: 'Position',
        include: [{
          model: Enterprise,
          as: 'Enterprise',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'real_name']
          }]
        }]
      }
    ];

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Filter based on user role
    if (userRole === 'student') {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (!student) {
        return res.status(404).json(notFoundErrorResponse('学生信息'));
      }
      whereClause.student_id = student.id;
    } else if (userRole === 'teacher') {
      // Teachers can see all applications
      includeClause.push({
        model: Teacher,
        as: 'reviewer',
        required: false,
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'real_name']
        }]
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const applications = await Application.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['applied_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return res.status(200).json(successResponse({
      applications: applications.rows,
      total: applications.count
    }, '获取申请列表成功'));

  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Get application details
 * GET /api/applications/:id
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'real_name', 'email', 'phone']
          }]
        },
        {
          model: Position,
          as: 'Position',
          include: [{
            model: Enterprise,
            as: 'Enterprise',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'real_name', 'email', 'phone']
            }]
          }]
        },
        {
          model: Teacher,
          as: 'reviewer',
          required: false,
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'real_name']
          }]
        }
      ]
    });

    if (!application) {
      return res.status(404).json(notFoundErrorResponse('申请'));
    }

    // Check authorization - students can only view their own applications
    if (userRole === 'student') {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (!student || application.student_id !== student.id) {
        return res.status(403).json(errorResponse('FORBIDDEN', '您没有权限查看此申请'));
      }
    }

    return res.status(200).json(successResponse(application, '获取申请详情成功'));

  } catch (error) {
    console.error('Get application by id error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Approve an application
 * PUT /api/applications/:id/approve
 * Validates Requirements 5.2, 5.4, 5.5
 */
const approveApplication = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get teacher record
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!teacher) {
      await transaction.rollback();
      return res.status(404).json(notFoundErrorResponse('教师信息'));
    }

    // Get application
    const application = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id']
          }]
        },
        {
          model: Position,
          as: 'Position',
          include: [{
            model: Enterprise,
            as: 'Enterprise',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id']
            }]
          }]
        }
      ],
      transaction
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json(notFoundErrorResponse('申请'));
    }

    // Check if application is in pending status
    if (application.status !== 'pending') {
      await transaction.rollback();
      return res.status(409).json(
        businessErrorResponse('INVALID_STATUS', '只能审批待审批状态的申请')
      );
    }

    // Update application status (Requirement 5.2)
    application.status = 'approved';
    application.reviewed_at = new Date();
    application.reviewed_by = teacher.id;
    application.teacher_id = teacher.id;
    await application.save({ transaction });

    // Create internship record (Requirement 5.4)
    const internship = await Internship.create({
      application_id: application.id,
      student_id: application.student_id,
      position_id: application.position_id,
      enterprise_id: application.Position.enterprise_id,
      teacher_id: teacher.id,
      start_date: application.Position.start_date,
      end_date: application.Position.end_date,
      status: 'ongoing'
    }, { transaction });

    // Decrease available slots (Requirement 5.4)
    const position = application.Position;
    position.available_slots = Math.max(0, position.available_slots - 1);
    await position.save({ transaction });

    // Send notifications to student and enterprise (Requirement 5.2)
    const notifications = [
      {
        user_id: application.Student.User.id,
        title: '实习申请已通过',
        content: `您的实习申请已通过审批，岗位：${application.Position.title}`,
        type: 'application_approved',
        is_read: false,
        created_at: new Date()
      },
      {
        user_id: application.Position.Enterprise.user.id,
        title: '新的实习生',
        content: `学生的实习申请已通过，岗位：${application.Position.title}`,
        type: 'application_approved',
        is_read: false,
        created_at: new Date()
      }
    ];

    await Notification.bulkCreate(notifications, { transaction });

    await transaction.commit();

    // Log application approval
    await operationLogService.logApplicationApproval(userId, id, req);

    // Return updated application with internship
    const updatedApplication = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'real_name', 'email']
          }]
        },
        {
          model: Position,
          as: 'Position'
        },
        {
          model: Teacher,
          as: 'reviewer',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'real_name']
          }]
        },
        {
          model: Internship,
          as: 'internship'
        }
      ]
    });

    return res.status(200).json(successResponse(updatedApplication, '申请已批准，实习记录已创建'));

  } catch (error) {
    await transaction.rollback();
    console.error('Approve application error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Reject an application
 * PUT /api/applications/:id/reject
 * Validates Requirements 5.3, 5.5
 */
const rejectApplication = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user.id;

    // Validate rejection reason (Requirement 5.3)
    if (!rejection_reason || rejection_reason.trim() === '') {
      await transaction.rollback();
      return res.status(400).json(
        validationErrorResponse([
          { field: 'rejection_reason', message: '拒绝原因不能为空' }
        ])
      );
    }

    // Get teacher record
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!teacher) {
      await transaction.rollback();
      return res.status(404).json(notFoundErrorResponse('教师信息'));
    }

    // Get application
    const application = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id']
          }]
        },
        {
          model: Position,
          as: 'Position'
        }
      ],
      transaction
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json(notFoundErrorResponse('申请'));
    }

    // Check if application is in pending status
    if (application.status !== 'pending') {
      await transaction.rollback();
      return res.status(409).json(
        businessErrorResponse('INVALID_STATUS', '只能审批待审批状态的申请')
      );
    }

    // Update application status (Requirement 5.3, 5.5)
    application.status = 'rejected';
    application.rejection_reason = rejection_reason.trim();
    application.reviewed_at = new Date();
    application.reviewed_by = teacher.id;
    await application.save({ transaction });

    // Send notification to student
    await Notification.create({
      user_id: application.Student.User.id,
      title: '实习申请已被拒绝',
      content: `您的实习申请已被拒绝，岗位：${application.Position.title}。原因：${rejection_reason}`,
      type: 'application_rejected',
      is_read: false,
      created_at: new Date()
    }, { transaction });

    await transaction.commit();

    // Log application rejection
    await operationLogService.logApplicationRejection(userId, id, rejection_reason, req);

    // Return updated application
    const updatedApplication = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'real_name', 'email']
          }]
        },
        {
          model: Position,
          as: 'Position'
        },
        {
          model: Teacher,
          as: 'reviewer',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'real_name']
          }]
        }
      ]
    });

    return res.status(200).json(successResponse(updatedApplication, '申请已拒绝'));

  } catch (error) {
    await transaction.rollback();
    console.error('Reject application error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

module.exports = {
  submitApplication,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication
};
