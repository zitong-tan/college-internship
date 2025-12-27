const jwt = require('jsonwebtoken');
const { User, Student, Teacher, Enterprise } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { sequelize } = require('../config/database');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { username, password, role, email, phone, real_name, ...roleSpecificData } = req.body;

    // Validate required fields
    if (!username || !password || !role || !email || !real_name) {
      await transaction.rollback();
      return errorResponse(res, 'Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Validate role
    if (!['student', 'teacher', 'enterprise'].includes(role)) {
      await transaction.rollback();
      return errorResponse(res, 'Invalid role', 400, 'VALIDATION_ERROR');
    }

    // Validate password length
    if (password.length < 6) {
      await transaction.rollback();
      return errorResponse(res, 'Password must be at least 6 characters', 400, 'VALIDATION_ERROR');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return errorResponse(res, 'Username or email already exists', 409, 'DUPLICATE_USER');
    }

    // Create user (password will be hashed by the model hook)
    const user = await User.create({
      username,
      password_hash: password, // Will be hashed by beforeCreate hook
      role,
      email,
      phone,
      real_name
    }, { transaction });

    // Create role-specific record
    if (role === 'student' && roleSpecificData.student_number) {
      await Student.create({
        user_id: user.id,
        student_number: roleSpecificData.student_number,
        major: roleSpecificData.major,
        grade: roleSpecificData.grade,
        class_name: roleSpecificData.class_name
      }, { transaction });
    } else if (role === 'teacher' && roleSpecificData.teacher_number) {
      await Teacher.create({
        user_id: user.id,
        teacher_number: roleSpecificData.teacher_number,
        department: roleSpecificData.department,
        title: roleSpecificData.title
      }, { transaction });
    } else if (role === 'enterprise' && roleSpecificData.company_name) {
      await Enterprise.create({
        user_id: user.id,
        company_name: roleSpecificData.company_name,
        industry: roleSpecificData.industry,
        address: roleSpecificData.address,
        website: roleSpecificData.website
      }, { transaction });
    }

    await transaction.commit();

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      real_name: user.real_name
    };

    return successResponse(res, userData, 'User registered successfully', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Login user and generate JWT token
 * 简化版本：明文密码验证
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400, 'VALIDATION_ERROR');
    }

    // Find user by username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // 简单密码验证 - 直接比较明文
    const isPasswordValid = user.verifyPassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    // Return token and user data
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      real_name: user.real_name,
      token
    };

    return successResponse(res, userData, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint is mainly for logging purposes
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'student') {
      roleData = await Student.findOne({ where: { user_id: userId } });
    } else if (user.role === 'teacher') {
      roleData = await Teacher.findOne({ where: { user_id: userId } });
    } else if (user.role === 'enterprise') {
      roleData = await Enterprise.findOne({ where: { user_id: userId } });
    }

    const userData = {
      ...user.toJSON(),
      roleData
    };

    return successResponse(res, userData, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password
 * 简化版本：明文密码
 */
const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400, 'VALIDATION_ERROR');
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400, 'VALIDATION_ERROR');
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
    }

    // 简单密码验证
    const isPasswordValid = user.verifyPassword(currentPassword);

    if (!isPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    // 直接更新明文密码
    await user.update({ password_hash: newPassword });

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updatePassword
};
