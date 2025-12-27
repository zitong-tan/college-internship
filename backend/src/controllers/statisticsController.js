/**
 * Statistics Controller
 * Handles statistical data queries and report generation
 */

const { Op } = require('sequelize');
const { sequelize } = require('../models');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Position = require('../models/Position');
const Enterprise = require('../models/Enterprise');
const Student = require('../models/Student');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get statistics overview
 * Supports filtering by time period
 * Requirements: 8.2, 8.3
 */
const getStatisticsOverview = async (req, res, next) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    // Build date filter for applications (use applied_at field)
    let applicationDateFilter = {};
    if (startDate && endDate) {
      applicationDateFilter = {
        applied_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (period) {
      // Handle predefined periods (monthly, semester)
      const now = new Date();
      let periodStart;
      
      switch (period) {
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'semester':
          // Assume semester is 6 months
          periodStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      applicationDateFilter = {
        applied_at: {
          [Op.gte]: periodStart
        }
      };
    }
    
    // Get application statistics
    const totalApplications = await Application.count({
      where: applicationDateFilter
    });
    
    const approvedApplications = await Application.count({
      where: {
        ...applicationDateFilter,
        status: 'approved'
      }
    });
    
    const rejectedApplications = await Application.count({
      where: {
        ...applicationDateFilter,
        status: 'rejected'
      }
    });
    
    const pendingApplications = await Application.count({
      where: {
        ...applicationDateFilter,
        status: 'pending'
      }
    });
    
    // Calculate approval rate
    const approvalRate = totalApplications > 0 
      ? ((approvedApplications / totalApplications) * 100).toFixed(2)
      : 0;
    
    // Build date filter for internships (use created_at field)
    let internshipDateFilter = {};
    if (startDate && endDate) {
      internshipDateFilter = {
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (period) {
      const now = new Date();
      let periodStart;
      
      switch (period) {
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'semester':
          periodStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      internshipDateFilter = {
        created_at: {
          [Op.gte]: periodStart
        }
      };
    }
    
    // Get internship statistics
    const totalInternships = await Internship.count({
      where: internshipDateFilter
    });
    
    const ongoingInternships = await Internship.count({
      where: {
        ...internshipDateFilter,
        status: 'ongoing'
      }
    });
    
    const completedInternships = await Internship.count({
      where: {
        ...internshipDateFilter,
        status: 'completed'
      }
    });
    
    // Build date filter for positions (use created_at field)
    let positionDateFilter = {};
    if (startDate && endDate) {
      positionDateFilter = {
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (period) {
      const now = new Date();
      let periodStart;
      
      switch (period) {
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'semester':
          periodStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      positionDateFilter = {
        created_at: {
          [Op.gte]: periodStart
        }
      };
    }
    
    // Get position statistics
    const totalPositions = await Position.count({
      where: positionDateFilter
    });
    
    const openPositions = await Position.count({
      where: {
        ...positionDateFilter,
        status: 'open'
      }
    });
    
    // Get total counts for students and enterprises
    const totalStudents = await Student.count();
    const totalEnterprises = await Enterprise.count();
    
    // Get monthly trend data
    const monthlyTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(applied_at, '%Y-%m') as month,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications
      WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get enterprise details with application counts
    const enterpriseDetails = await sequelize.query(`
      SELECT 
        e.id,
        e.company_name,
        COUNT(DISTINCT p.id) as position_count,
        COUNT(DISTINCT i.student_id) as student_count,
        COUNT(DISTINCT a.id) as application_count,
        SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved_count
      FROM enterprises e
      LEFT JOIN positions p ON e.id = p.enterprise_id
      LEFT JOIN internships i ON e.id = i.enterprise_id
      LEFT JOIN applications a ON p.id = a.position_id
      GROUP BY e.id, e.company_name
      ORDER BY position_count DESC, student_count DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    const statistics = {
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      approvalRate: parseFloat(approvalRate),
      totalInternships,
      ongoingInternships,
      completedInternships,
      totalPositions,
      openPositions,
      totalStudents,
      totalEnterprises,
      monthlyTrend: monthlyTrend.map(stat => ({
        month: stat.month,
        total: parseInt(stat.total),
        approved: parseInt(stat.approved),
        rejected: parseInt(stat.rejected)
      })),
      enterpriseDetails: enterpriseDetails.map(stat => ({
        id: stat.id,
        company_name: stat.company_name,
        position_count: parseInt(stat.position_count) || 0,
        student_count: parseInt(stat.student_count) || 0,
        application_count: parseInt(stat.application_count) || 0,
        approved_count: parseInt(stat.approved_count) || 0
      }))
    };
    
    return successResponse(res, statistics, '统计数据获取成功');
  } catch (error) {
    console.error('Get statistics error:', error);
    return next(error);
  }
};

/**
 * Get enterprise-specific statistics
 * Requirements: 8.3
 */
const getEnterpriseStatistics = async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verify enterprise exists
    const enterprise = await Enterprise.findByPk(enterpriseId);
    if (!enterprise) {
      return errorResponse(res, 'ENTERPRISE_NOT_FOUND', '企业不存在', 404);
    }
    
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }
    
    // Get position statistics
    const positions = await Position.findAll({
      where: {
        enterprise_id: enterpriseId,
        ...dateFilter
      },
      attributes: [
        'id',
        'title',
        'total_slots',
        'available_slots',
        'status',
        'createdAt'
      ]
    });
    
    // Get student distribution by position
    const studentDistribution = await sequelize.query(`
      SELECT 
        p.id as position_id,
        p.title as position_title,
        COUNT(i.student_id) as student_count,
        AVG(i.final_score) as avg_score
      FROM positions p
      LEFT JOIN internships i ON p.id = i.position_id
      WHERE p.enterprise_id = :enterpriseId
        ${startDate && endDate ? `AND p.createdAt BETWEEN :startDate AND :endDate` : ''}
      GROUP BY p.id, p.title
      ORDER BY student_count DESC
    `, {
      replacements: { 
        enterpriseId,
        startDate: startDate || null,
        endDate: endDate || null
      },
      type: sequelize.QueryTypes.SELECT
    });
    
    const statistics = {
      enterprise: {
        id: enterprise.id,
        companyName: enterprise.company_name,
        industry: enterprise.industry
      },
      positions: {
        total: positions.length,
        open: positions.filter(p => p.status === 'open').length,
        full: positions.filter(p => p.status === 'full').length,
        closed: positions.filter(p => p.status === 'closed').length,
        totalSlots: positions.reduce((sum, p) => sum + p.total_slots, 0),
        availableSlots: positions.reduce((sum, p) => sum + p.available_slots, 0)
      },
      studentDistribution: studentDistribution.map(stat => ({
        positionId: stat.position_id,
        positionTitle: stat.position_title,
        studentCount: parseInt(stat.student_count) || 0,
        averageScore: stat.avg_score ? parseFloat(stat.avg_score).toFixed(2) : null
      }))
    };
    
    return successResponse(res, statistics, '企业统计数据获取成功');
  } catch (error) {
    console.error('Get enterprise statistics error:', error);
    return next(error);
  }
};

/**
 * Get time-series statistics
 * Requirements: 8.2
 */
const getTimeSeriesStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    if (!startDate || !endDate) {
      return errorResponse(res, 'VALIDATION_ERROR', '请提供开始日期和结束日期', 400);
    }
    
    // Determine date format based on groupBy
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }
    
    // Get application time series
    const applicationTimeSeries = await sequelize.query(`
      SELECT 
        DATE_FORMAT(applied_at, :dateFormat) as period,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM applications
      WHERE applied_at BETWEEN :startDate AND :endDate
      GROUP BY period
      ORDER BY period
    `, {
      replacements: { dateFormat, startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get internship time series
    const internshipTimeSeries = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, :dateFormat) as period,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending_evaluation' THEN 1 ELSE 0 END) as pending_evaluation
      FROM internships
      WHERE createdAt BETWEEN :startDate AND :endDate
      GROUP BY period
      ORDER BY period
    `, {
      replacements: { dateFormat, startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    const statistics = {
      applications: applicationTimeSeries.map(stat => ({
        period: stat.period,
        total: parseInt(stat.total),
        approved: parseInt(stat.approved),
        rejected: parseInt(stat.rejected),
        pending: parseInt(stat.pending)
      })),
      internships: internshipTimeSeries.map(stat => ({
        period: stat.period,
        total: parseInt(stat.total),
        ongoing: parseInt(stat.ongoing),
        completed: parseInt(stat.completed),
        pendingEvaluation: parseInt(stat.pending_evaluation)
      })),
      groupBy,
      dateRange: {
        startDate,
        endDate
      }
    };
    
    return successResponse(res, statistics, '时间序列统计数据获取成功');
  } catch (error) {
    console.error('Get time series statistics error:', error);
    return next(error);
  }
};

module.exports = {
  getStatisticsOverview,
  getEnterpriseStatistics,
  getTimeSeriesStatistics
};

/**
 * Export statistics report as Excel
 * Requirements: 8.4
 */
const exportExcelReport = async (req, res, next) => {
  try {
    const ExcelJS = require('exceljs');
    const { startDate, endDate, period } = req.query;
    
    // Get statistics data (reuse the overview logic)
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (period) {
      const now = new Date();
      let periodStart;
      
      switch (period) {
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'semester':
          periodStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      dateFilter = {
        createdAt: {
          [Op.gte]: periodStart
        }
      };
    }
    
    // Get all statistics
    const totalApplications = await Application.count({ where: dateFilter });
    const approvedApplications = await Application.count({ where: { ...dateFilter, status: 'approved' } });
    const rejectedApplications = await Application.count({ where: { ...dateFilter, status: 'rejected' } });
    const pendingApplications = await Application.count({ where: { ...dateFilter, status: 'pending' } });
    const approvalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(2) : 0;
    
    const totalInternships = await Internship.count({ where: dateFilter });
    const ongoingInternships = await Internship.count({ where: { ...dateFilter, status: 'ongoing' } });
    const completedInternships = await Internship.count({ where: { ...dateFilter, status: 'completed' } });
    
    const totalPositions = await Position.count({ where: dateFilter });
    const openPositions = await Position.count({ where: { ...dateFilter, status: 'open' } });
    
    const enterpriseStats = await sequelize.query(`
      SELECT 
        e.id,
        e.company_name,
        e.industry,
        COUNT(DISTINCT p.id) as position_count,
        COUNT(DISTINCT i.student_id) as student_count,
        AVG(i.final_score) as avg_score
      FROM enterprises e
      LEFT JOIN positions p ON e.id = p.enterprise_id
      LEFT JOIN internships i ON e.id = i.enterprise_id
      WHERE 1=1
        ${startDate && endDate ? `AND p.createdAt BETWEEN '${startDate}' AND '${endDate}'` : ''}
      GROUP BY e.id, e.company_name, e.industry
      ORDER BY position_count DESC, student_count DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '高校实习管理系统';
    workbook.created = new Date();
    
    // Add summary sheet
    const summarySheet = workbook.addWorksheet('统计概览');
    
    // Set column widths
    summarySheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 15 }
    ];
    
    // Add title
    summarySheet.mergeCells('A1:C1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = '实习管理系统统计报表';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Add date range
    summarySheet.mergeCells('A2:C2');
    const dateCell = summarySheet.getCell('A2');
    dateCell.value = `统计周期: ${startDate || '开始'} 至 ${endDate || '现在'}`;
    dateCell.alignment = { horizontal: 'center' };
    
    // Add application statistics
    summarySheet.addRow([]);
    summarySheet.addRow(['申请统计', '', '']);
    summarySheet.getCell('A4').font = { bold: true };
    summarySheet.addRow(['总申请数', totalApplications, '']);
    summarySheet.addRow(['已批准', approvedApplications, '']);
    summarySheet.addRow(['已拒绝', rejectedApplications, '']);
    summarySheet.addRow(['待审批', pendingApplications, '']);
    summarySheet.addRow(['通过率', `${approvalRate}%`, '']);
    
    // Add internship statistics
    summarySheet.addRow([]);
    summarySheet.addRow(['实习统计', '', '']);
    summarySheet.getCell('A10').font = { bold: true };
    summarySheet.addRow(['总实习数', totalInternships, '']);
    summarySheet.addRow(['进行中', ongoingInternships, '']);
    summarySheet.addRow(['已完成', completedInternships, '']);
    
    // Add position statistics
    summarySheet.addRow([]);
    summarySheet.addRow(['岗位统计', '', '']);
    summarySheet.getCell('A15').font = { bold: true };
    summarySheet.addRow(['总岗位数', totalPositions, '']);
    summarySheet.addRow(['开放岗位', openPositions, '']);
    
    // Add enterprise statistics sheet
    const enterpriseSheet = workbook.addWorksheet('企业统计');
    enterpriseSheet.columns = [
      { header: '企业ID', key: 'id', width: 10 },
      { header: '企业名称', key: 'company_name', width: 30 },
      { header: '行业', key: 'industry', width: 20 },
      { header: '岗位数量', key: 'position_count', width: 12 },
      { header: '学生数量', key: 'student_count', width: 12 },
      { header: '平均评分', key: 'avg_score', width: 12 }
    ];
    
    // Style header row
    enterpriseSheet.getRow(1).font = { bold: true };
    enterpriseSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add enterprise data
    enterpriseStats.forEach(stat => {
      enterpriseSheet.addRow({
        id: stat.id,
        company_name: stat.company_name,
        industry: stat.industry || '未分类',
        position_count: parseInt(stat.position_count) || 0,
        student_count: parseInt(stat.student_count) || 0,
        avg_score: stat.avg_score ? parseFloat(stat.avg_score).toFixed(2) : 'N/A'
      });
    });
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=statistics_report_${Date.now()}.xlsx`
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel report error:', error);
    return next(error);
  }
};

/**
 * Export statistics report as PDF
 * Requirements: 8.4
 */
const exportPdfReport = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const { startDate, endDate, period } = req.query;
    
    // Get statistics data (reuse the overview logic)
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (period) {
      const now = new Date();
      let periodStart;
      
      switch (period) {
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'semester':
          periodStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      dateFilter = {
        createdAt: {
          [Op.gte]: periodStart
        }
      };
    }
    
    // Get all statistics
    const totalApplications = await Application.count({ where: dateFilter });
    const approvedApplications = await Application.count({ where: { ...dateFilter, status: 'approved' } });
    const rejectedApplications = await Application.count({ where: { ...dateFilter, status: 'rejected' } });
    const pendingApplications = await Application.count({ where: { ...dateFilter, status: 'pending' } });
    const approvalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(2) : 0;
    
    const totalInternships = await Internship.count({ where: dateFilter });
    const ongoingInternships = await Internship.count({ where: { ...dateFilter, status: 'ongoing' } });
    const completedInternships = await Internship.count({ where: { ...dateFilter, status: 'completed' } });
    
    const totalPositions = await Position.count({ where: dateFilter });
    const openPositions = await Position.count({ where: { ...dateFilter, status: 'open' } });
    
    const enterpriseStats = await sequelize.query(`
      SELECT 
        e.id,
        e.company_name,
        e.industry,
        COUNT(DISTINCT p.id) as position_count,
        COUNT(DISTINCT i.student_id) as student_count,
        AVG(i.final_score) as avg_score
      FROM enterprises e
      LEFT JOIN positions p ON e.id = p.enterprise_id
      LEFT JOIN internships i ON e.id = i.enterprise_id
      WHERE 1=1
        ${startDate && endDate ? `AND p.createdAt BETWEEN '${startDate}' AND '${endDate}'` : ''}
      GROUP BY e.id, e.company_name, e.industry
      ORDER BY position_count DESC, student_count DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=statistics_report_${Date.now()}.pdf`
    );
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('实习管理系统统计报表', { align: 'center' });
    doc.moveDown();
    
    // Add date range
    doc.fontSize(12).text(`统计周期: ${startDate || '开始'} 至 ${endDate || '现在'}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add application statistics
    doc.fontSize(16).text('申请统计', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`总申请数: ${totalApplications}`);
    doc.text(`已批准: ${approvedApplications}`);
    doc.text(`已拒绝: ${rejectedApplications}`);
    doc.text(`待审批: ${pendingApplications}`);
    doc.text(`通过率: ${approvalRate}%`);
    doc.moveDown(2);
    
    // Add internship statistics
    doc.fontSize(16).text('实习统计', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`总实习数: ${totalInternships}`);
    doc.text(`进行中: ${ongoingInternships}`);
    doc.text(`已完成: ${completedInternships}`);
    doc.moveDown(2);
    
    // Add position statistics
    doc.fontSize(16).text('岗位统计', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`总岗位数: ${totalPositions}`);
    doc.text(`开放岗位: ${openPositions}`);
    doc.moveDown(2);
    
    // Add enterprise statistics
    doc.fontSize(16).text('企业统计 (前10名)', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    
    if (enterpriseStats.length > 0) {
      enterpriseStats.forEach((stat, index) => {
        doc.text(
          `${index + 1}. ${stat.company_name} - 岗位: ${stat.position_count || 0}, 学生: ${stat.student_count || 0}, 平均分: ${stat.avg_score ? parseFloat(stat.avg_score).toFixed(2) : 'N/A'}`
        );
      });
    } else {
      doc.text('暂无企业数据');
    }
    
    // Add footer
    doc.moveDown(3);
    doc.fontSize(10).text(
      `报表生成时间: ${new Date().toLocaleString('zh-CN')}`,
      { align: 'center' }
    );
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Export PDF report error:', error);
    return next(error);
  }
};

module.exports = {
  getStatisticsOverview,
  getEnterpriseStatistics,
  getTimeSeriesStatistics,
  exportExcelReport,
  exportPdfReport
};
