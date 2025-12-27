/**
 * Internship Controller
 * Handles internship process management including logs, files, progress, and evaluations
 */

const { Internship, InternshipLog, InternshipFile, Student, Position, Enterprise, Teacher, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const operationLogService = require('../services/operationLogService');
const path = require('path');
const fs = require('fs').promises;

/**
 * Submit internship log
 * POST /api/internships/:id/logs
 */
exports.submitLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, log_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate required fields
    if (!content || !log_date) {
      return errorResponse(res, 'VALIDATION_ERROR', '日志内容和日期不能为空', 400);
    }

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User' }]
        }
      ]
    });

    if (!internship) {
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - only the student can submit logs
    if (userRole !== 'student' || internship.Student.User.id !== userId) {
      return errorResponse(res, 'FORBIDDEN', '您没有权限提交此实习日志', 403);
    }

    // Create log
    const log = await InternshipLog.create({
      internship_id: id,
      content,
      log_date,
      created_at: new Date()
    });

    return successResponse(res, log, '日志提交成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get internship logs
 * GET /api/internships/:id/logs
 */
exports.getLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User' }]
        },
        {
          model: Teacher,
          as: 'Teacher',
          include: [{ model: User, as: 'User' }]
        }
      ]
    });

    if (!internship) {
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - student, teacher, or enterprise can view logs
    const isStudent = userRole === 'student' && internship.Student.User.id === userId;
    const isTeacher = userRole === 'teacher' && internship.Teacher && internship.Teacher.User.id === userId;
    
    // Check if user is the enterprise for this internship
    let isEnterprise = false;
    if (userRole === 'enterprise') {
      const enterprise = await Enterprise.findOne({
        where: { user_id: userId }
      });
      if (enterprise && internship.enterprise_id === enterprise.id) {
        isEnterprise = true;
      }
    }
    
    if (!isStudent && !isTeacher && !isEnterprise) {
      return errorResponse(res, 'FORBIDDEN', '您没有权限查看此实习日志', 403);
    }

    // Get logs
    const logs = await InternshipLog.findAll({
      where: { internship_id: id },
      order: [['log_date', 'DESC'], ['created_at', 'DESC']]
    });

    return successResponse(res, {
      logs: logs,
      total: logs.length
    }, '获取日志成功');
  } catch (error) {
    next(error);
  }
};

/**
 * Get internship details
 * GET /api/internships/:id
 */
exports.getInternship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find internship with all related data
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User', attributes: ['id', 'username', 'email', 'real_name'] }]
        },
        {
          model: Position,
          as: 'Position'
        },
        {
          model: Enterprise,
          as: 'Enterprise',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'real_name'] }]
        },
        {
          model: Teacher,
          as: 'Teacher',
          include: [{ model: User, as: 'User', attributes: ['id', 'username', 'email', 'real_name'] }]
        }
      ]
    });

    if (!internship) {
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission
    const isStudent = userRole === 'student' && internship.Student.User.id === userId;
    const isTeacher = userRole === 'teacher' && internship.Teacher && internship.Teacher.User.id === userId;
    
    // Check if user is the enterprise for this internship
    let isEnterprise = false;
    if (userRole === 'enterprise') {
      const enterprise = await Enterprise.findOne({
        where: { user_id: userId }
      });
      if (enterprise && internship.enterprise_id === enterprise.id) {
        isEnterprise = true;
      }
    }
    
    if (!isStudent && !isTeacher && !isEnterprise) {
      return errorResponse(res, 'FORBIDDEN', '您没有权限查看此实习记录', 403);
    }

    // Check and update status if expired
    await checkAndUpdateStatus(internship);

    // Calculate progress
    const progress = calculateProgress(internship);
    const internshipData = internship.toJSON();
    internshipData.progress = progress;

    return successResponse(res, internshipData, '获取实习记录成功');
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate internship progress
 * @param {Object} internship - Internship instance
 * @returns {Object} Progress information
 */
function calculateProgress(internship) {
  const now = new Date();
  const startDate = new Date(internship.start_date);
  const endDate = new Date(internship.end_date);

  // Calculate total days
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Calculate completed days
  let completedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  
  // Ensure completedDays is not negative
  if (completedDays < 0) {
    completedDays = 0;
  }
  
  // Ensure completedDays doesn't exceed totalDays
  if (completedDays > totalDays) {
    completedDays = totalDays;
  }

  // Calculate percentage (0-100)
  const percentage = totalDays > 0 ? Math.min(100, Math.round((completedDays / totalDays) * 100)) : 0;

  return {
    total_days: totalDays,
    completed_days: completedDays,
    percentage: percentage,
    is_completed: completedDays >= totalDays
  };
}

/**
 * Get internship progress
 * GET /api/internships/:id/progress
 */
exports.getProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User' }]
        },
        {
          model: Teacher,
          as: 'Teacher',
          include: [{ model: User, as: 'User' }]
        }
      ]
    });

    if (!internship) {
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission
    const isStudent = userRole === 'student' && internship.Student.User.id === userId;
    const isTeacher = userRole === 'teacher' && internship.Teacher && internship.Teacher.User.id === userId;
    
    // Check if user is the enterprise for this internship
    let isEnterprise = false;
    if (userRole === 'enterprise') {
      const enterprise = await Enterprise.findOne({
        where: { user_id: userId }
      });
      if (enterprise && internship.enterprise_id === enterprise.id) {
        isEnterprise = true;
      }
    }
    
    if (!isStudent && !isTeacher && !isEnterprise) {
      return errorResponse(res, 'FORBIDDEN', '您没有权限查看此实习进度', 403);
    }

    // Calculate and return progress
    const progress = calculateProgress(internship);
    
    return successResponse(res, progress, '获取实习进度成功');
  } catch (error) {
    next(error);
  }
};

/**
 * Update expired internships status
 * This function checks all ongoing internships and updates their status to 'pending_evaluation'
 * if they have reached or passed their end date
 */
async function updateExpiredInternships() {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for date comparison

    // Find all ongoing internships that have passed their end date
    const expiredInternships = await Internship.findAll({
      where: {
        status: 'ongoing',
        end_date: {
          [Op.lt]: now
        }
      }
    });

    // Update each expired internship
    const updatePromises = expiredInternships.map(internship => 
      internship.update({ status: 'pending_evaluation' })
    );

    await Promise.all(updatePromises);

    return {
      updated: expiredInternships.length,
      internships: expiredInternships.map(i => i.id)
    };
  } catch (error) {
    console.error('Error updating expired internships:', error);
    throw error;
  }
}

/**
 * Check and update internship status
 * This is called when accessing internship data to ensure status is current
 */
async function checkAndUpdateStatus(internship) {
  if (internship.status === 'ongoing') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endDate = new Date(internship.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < now) {
      await internship.update({ status: 'pending_evaluation' });
      return true; // Status was updated
    }
  }
  return false; // Status was not updated
}

/**
 * Manually trigger status update for expired internships
 * POST /api/internships/update-expired
 */
exports.updateExpiredStatus = async (req, res, next) => {
  try {
    // Only teachers or admins should be able to trigger this
    if (req.user.role !== 'teacher') {
      return errorResponse(res, 'FORBIDDEN', '您没有权限执行此操作', 403);
    }

    const result = await updateExpiredInternships();
    
    return successResponse(res, result, `成功更新 ${result.updated} 个过期实习记录的状态`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get internship list
 * GET /api/internships
 */
exports.getInternships = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};

    // Filter based on user role
    if (userRole === 'student') {
      const student = await Student.findOne({
        where: { user_id: userId }
      });
      if (!student) {
        return errorResponse(res, 'NOT_FOUND', '学生信息不存在', 404);
      }
      whereClause.student_id = student.id;
    } else if (userRole === 'teacher') {
      const teacher = await Teacher.findOne({
        where: { user_id: userId }
      });
      if (!teacher) {
        return errorResponse(res, 'NOT_FOUND', '教师信息不存在', 404);
      }
      whereClause.teacher_id = teacher.id;
    } else if (userRole === 'enterprise') {
      const enterprise = await Enterprise.findOne({
        where: { user_id: userId }
      });
      if (!enterprise) {
        return errorResponse(res, 'NOT_FOUND', '企业信息不存在', 404);
      }
      whereClause.enterprise_id = enterprise.id;
    }

    const internships = await Internship.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User', attributes: ['id', 'username', 'email', 'real_name', 'phone'] }]
        },
        {
          model: Position,
          as: 'Position'
        },
        {
          model: Enterprise,
          as: 'Enterprise',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'real_name'] }]
        },
        {
          model: Teacher,
          as: 'Teacher',
          include: [{ model: User, as: 'User', attributes: ['id', 'username', 'email', 'real_name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, {
      internships: internships,
      total: internships.length
    }, '获取实习列表成功');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload internship file
 * POST /api/internships/:id/files
 */
exports.uploadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if file was uploaded
    if (!req.file) {
      return errorResponse(res, 'VALIDATION_ERROR', '请选择要上传的文件', 400);
    }

    const file = req.file;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      // Delete the uploaded file
      await fs.unlink(file.path).catch(() => {});
      return errorResponse(res, 'VALIDATION_ERROR', '文件大小不能超过10MB', 400);
    }

    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    if (!allowedTypes.includes(fileExt) && !allowedMimeTypes.includes(file.mimetype)) {
      // Delete the uploaded file
      await fs.unlink(file.path).catch(() => {});
      return errorResponse(res, 'VALIDATION_ERROR', '不支持的文件格式，仅支持 PDF、DOC、DOCX、JPG、PNG', 400);
    }

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User' }]
        }
      ]
    });

    if (!internship) {
      // Delete the uploaded file
      await fs.unlink(file.path).catch(() => {});
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - only the student can upload files
    if (userRole !== 'student' || internship.Student.User.id !== userId) {
      // Delete the uploaded file
      await fs.unlink(file.path).catch(() => {});
      return errorResponse(res, 'FORBIDDEN', '您没有权限上传文件到此实习记录', 403);
    }

    // Save file record to database
    const fileRecord = await InternshipFile.create({
      internship_id: id,
      file_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      file_type: file.mimetype,
      uploaded_at: new Date()
    });

    return successResponse(res, fileRecord, '文件上传成功', 201);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

/**
 * Get internship files
 * GET /api/internships/:id/files
 */
exports.getFiles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User' }]
        },
        {
          model: Teacher,
          as: 'Teacher',
          include: [{ model: User, as: 'User' }]
        }
      ]
    });

    if (!internship) {
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - student, teacher, or enterprise can view files
    const isStudent = userRole === 'student' && internship.Student.User.id === userId;
    const isTeacher = userRole === 'teacher' && internship.Teacher && internship.Teacher.User.id === userId;
    
    // Check if user is the enterprise for this internship
    let isEnterprise = false;
    if (userRole === 'enterprise') {
      const enterprise = await Enterprise.findOne({
        where: { user_id: userId }
      });
      if (enterprise && internship.enterprise_id === enterprise.id) {
        isEnterprise = true;
      }
    }
    
    if (!isStudent && !isTeacher && !isEnterprise) {
      return errorResponse(res, 'FORBIDDEN', '您没有权限查看此实习文件', 403);
    }

    // Get files
    const files = await InternshipFile.findAll({
      where: { internship_id: id },
      order: [['uploaded_at', 'DESC']],
      attributes: ['id', 'file_name', 'file_size', 'file_type', 'uploaded_at']
    });

    return successResponse(res, {
      files: files,
      total: files.length
    }, '获取文件列表成功');
  } catch (error) {
    next(error);
  }
};

/**
 * Submit teacher evaluation
 * POST /api/internships/:id/evaluate/teacher
 */
exports.submitTeacherEvaluation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { score, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate user role
    if (userRole !== 'teacher') {
      await transaction.rollback();
      return errorResponse(res, 'FORBIDDEN', '只有教师可以提交教师评价', 403);
    }

    // Validate required fields
    if (score === undefined || score === null) {
      await transaction.rollback();
      return errorResponse(res, 'VALIDATION_ERROR', '评分不能为空', 400);
    }

    // Validate score range
    if (score < 0 || score > 100) {
      await transaction.rollback();
      return errorResponse(res, 'VALIDATION_ERROR', '评分必须在0-100之间', 400);
    }

    // Find teacher
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!teacher) {
      await transaction.rollback();
      return errorResponse(res, 'NOT_FOUND', '教师信息不存在', 404);
    }

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Teacher,
          as: 'Teacher'
        }
      ],
      transaction
    });

    if (!internship) {
      await transaction.rollback();
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - only the assigned teacher can evaluate
    if (!internship.Teacher || internship.Teacher.id !== teacher.id) {
      await transaction.rollback();
      return errorResponse(res, 'FORBIDDEN', '您没有权限评价此实习记录', 403);
    }

    // Check if internship is in correct status
    if (internship.status !== 'pending_evaluation' && internship.status !== 'completed') {
      await transaction.rollback();
      return errorResponse(res, 'BUSINESS_LOGIC_ERROR', '实习尚未结束，无法提交评价', 409);
    }

    // Save teacher evaluation
    await internship.update({
      teacher_score: score,
      teacher_comment: comment || null
    }, { transaction });

    // Calculate final score if both evaluations are present
    await calculateAndUpdateFinalScore(internship, transaction);

    // Check and update status if both evaluations are complete
    await checkAndUpdateCompletionStatus(internship, transaction);

    await transaction.commit();

    // Log teacher evaluation submission
    await operationLogService.logEvaluationSubmission(userId, id, 'teacher', score, req);

    // Reload to get updated data
    await internship.reload();

    return successResponse(res, {
      teacher_score: internship.teacher_score,
      teacher_comment: internship.teacher_comment,
      final_score: internship.final_score,
      status: internship.status
    }, '教师评价提交成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Submit enterprise evaluation
 * POST /api/internships/:id/evaluate/enterprise
 */
exports.submitEnterpriseEvaluation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { score, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate user role
    if (userRole !== 'enterprise') {
      await transaction.rollback();
      return errorResponse(res, 'FORBIDDEN', '只有企业可以提交企业评价', 403);
    }

    // Validate required fields
    if (score === undefined || score === null) {
      await transaction.rollback();
      return errorResponse(res, 'VALIDATION_ERROR', '评分不能为空', 400);
    }

    // Validate score range
    if (score < 0 || score > 100) {
      await transaction.rollback();
      return errorResponse(res, 'VALIDATION_ERROR', '评分必须在0-100之间', 400);
    }

    // Find enterprise
    const enterprise = await Enterprise.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!enterprise) {
      await transaction.rollback();
      return errorResponse(res, 'NOT_FOUND', '企业信息不存在', 404);
    }

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Enterprise,
          as: 'Enterprise'
        }
      ],
      transaction
    });

    if (!internship) {
      await transaction.rollback();
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - only the assigned enterprise can evaluate
    if (internship.Enterprise.id !== enterprise.id) {
      await transaction.rollback();
      return errorResponse(res, 'FORBIDDEN', '您没有权限评价此实习记录', 403);
    }

    // Check if internship is in correct status
    if (internship.status !== 'pending_evaluation' && internship.status !== 'completed') {
      await transaction.rollback();
      return errorResponse(res, 'BUSINESS_LOGIC_ERROR', '实习尚未结束，无法提交评价', 409);
    }

    // Save enterprise evaluation
    await internship.update({
      enterprise_score: score,
      enterprise_comment: comment || null
    }, { transaction });

    // Calculate final score if both evaluations are present
    await calculateAndUpdateFinalScore(internship, transaction);

    // Check and update status if both evaluations are complete
    await checkAndUpdateCompletionStatus(internship, transaction);

    await transaction.commit();

    // Log enterprise evaluation submission
    await operationLogService.logEvaluationSubmission(userId, id, 'enterprise', score, req);

    // Reload to get updated data
    await internship.reload();

    return successResponse(res, {
      enterprise_score: internship.enterprise_score,
      enterprise_comment: internship.enterprise_comment,
      final_score: internship.final_score,
      status: internship.status
    }, '企业评价提交成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Calculate and update final score
 * Final score = (teacher_score * 0.5 + enterprise_score * 0.5)
 */
async function calculateAndUpdateFinalScore(internship, transaction) {
  // Only calculate if both scores are present
  if (internship.teacher_score !== null && internship.enterprise_score !== null) {
    const finalScore = (parseFloat(internship.teacher_score) * 0.5 + parseFloat(internship.enterprise_score) * 0.5);
    await internship.update({ final_score: finalScore }, { transaction });
    return finalScore;
  }
  return null;
}

/**
 * Check and update completion status
 * Update status to 'completed' if both evaluations are submitted
 */
async function checkAndUpdateCompletionStatus(internship, transaction) {
  if (internship.teacher_score !== null && internship.enterprise_score !== null) {
    if (internship.status !== 'completed') {
      await internship.update({ status: 'completed' }, { transaction });
      return true;
    }
  }
  return false;
}

/**
 * Get internship evaluation (for students to view)
 * GET /api/internships/:id/evaluation
 */
exports.getEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find internship
    const internship = await Internship.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'Student',
          include: [{ model: User, as: 'User' }]
        }
      ]
    });

    if (!internship) {
      return errorResponse(res, 'NOT_FOUND', '实习记录不存在', 404);
    }

    // Check permission - only the student can view their own evaluation
    if (userRole !== 'student' || internship.Student.User.id !== userId) {
      return errorResponse(res, 'FORBIDDEN', '您没有权限查看此评价', 403);
    }

    // Return evaluation data
    const evaluationData = {
      teacher_score: internship.teacher_score,
      teacher_comment: internship.teacher_comment,
      enterprise_score: internship.enterprise_score,
      enterprise_comment: internship.enterprise_comment,
      final_score: internship.final_score,
      status: internship.status
    };

    return successResponse(res, evaluationData, '获取评价成功');
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
