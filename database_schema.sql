-- ============================================
-- 高校实习管理系统 - 数据库架构
-- ============================================
-- 版本: 1.0.0
-- 创建日期: 2024-01-15
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- ============================================

-- 1. 创建数据库
-- ============================================

DROP DATABASE IF EXISTS internship_management;

CREATE DATABASE internship_management 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE internship_management;

-- 2. 创建用户表
-- ============================================

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  role ENUM('student', 'teacher', 'enterprise') NOT NULL COMMENT '用户角色',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  phone VARCHAR(20) COMMENT '手机号',
  real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 3. 创建学生信息表
-- ============================================

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '学生ID',
  user_id INT UNIQUE NOT NULL COMMENT '用户ID',
  student_number VARCHAR(20) UNIQUE NOT NULL COMMENT '学号',
  major VARCHAR(100) COMMENT '专业',
  grade INT COMMENT '年级',
  class_name VARCHAR(50) COMMENT '班级',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_number (student_number),
  INDEX idx_major (major),
  INDEX idx_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生信息表';

-- 4. 创建教师信息表
-- ============================================

CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '教师ID',
  user_id INT UNIQUE NOT NULL COMMENT '用户ID',
  teacher_number VARCHAR(20) UNIQUE NOT NULL COMMENT '工号',
  department VARCHAR(100) COMMENT '院系',
  title VARCHAR(50) COMMENT '职称',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_teacher_number (teacher_number),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师信息表';

-- 5. 创建企业信息表
-- ============================================

CREATE TABLE enterprises (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '企业ID',
  user_id INT UNIQUE NOT NULL COMMENT '用户ID',
  company_name VARCHAR(200) NOT NULL COMMENT '公司名称',
  industry VARCHAR(100) COMMENT '行业',
  address VARCHAR(255) COMMENT '地址',
  website VARCHAR(255) COMMENT '网站',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_company_name (company_name),
  INDEX idx_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业信息表';


-- 6. 创建实习岗位表
-- ============================================

CREATE TABLE positions (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '岗位ID',
  enterprise_id INT NOT NULL COMMENT '企业ID',
  title VARCHAR(200) NOT NULL COMMENT '岗位标题',
  description TEXT NOT NULL COMMENT '岗位描述',
  requirements TEXT COMMENT '岗位要求',
  total_slots INT NOT NULL COMMENT '总名额',
  available_slots INT NOT NULL COMMENT '可用名额',
  start_date DATE NOT NULL COMMENT '开始日期',
  end_date DATE NOT NULL COMMENT '结束日期',
  status ENUM('open', 'full', 'closed') DEFAULT 'open' COMMENT '岗位状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
  INDEX idx_enterprise_id (enterprise_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_fulltext_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实习岗位表';

-- 7. 创建实习申请表
-- ============================================

CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '申请ID',
  student_id INT NOT NULL COMMENT '学生ID',
  position_id INT NOT NULL COMMENT '岗位ID',
  teacher_id INT COMMENT '指导教师ID',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '申请状态',
  personal_statement TEXT COMMENT '个人简介',
  contact_info VARCHAR(255) COMMENT '联系方式',
  rejection_reason TEXT COMMENT '拒绝原因',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  reviewed_at TIMESTAMP NULL COMMENT '审批时间',
  reviewed_by INT COMMENT '审批人ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES teachers(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_position_id (position_id),
  INDEX idx_status (status),
  INDEX idx_applied_at (applied_at),
  UNIQUE KEY uk_student_position (student_id, position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实习申请表';

-- 8. 创建实习记录表
-- ============================================

CREATE TABLE internships (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '实习记录ID',
  application_id INT UNIQUE NOT NULL COMMENT '申请ID',
  student_id INT NOT NULL COMMENT '学生ID',
  position_id INT NOT NULL COMMENT '岗位ID',
  enterprise_id INT NOT NULL COMMENT '企业ID',
  teacher_id INT COMMENT '指导教师ID',
  start_date DATE NOT NULL COMMENT '开始日期',
  end_date DATE NOT NULL COMMENT '结束日期',
  status ENUM('ongoing', 'pending_evaluation', 'completed') DEFAULT 'ongoing' COMMENT '实习状态',
  teacher_score DECIMAL(5,2) COMMENT '教师评分',
  enterprise_score DECIMAL(5,2) COMMENT '企业评分',
  final_score DECIMAL(5,2) COMMENT '综合评分',
  teacher_comment TEXT COMMENT '教师评语',
  enterprise_comment TEXT COMMENT '企业评语',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_enterprise_id (enterprise_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实习记录表';


-- 9. 创建实习日志表
-- ============================================

CREATE TABLE internship_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  internship_id INT NOT NULL COMMENT '实习记录ID',
  content TEXT NOT NULL COMMENT '日志内容',
  log_date DATE NOT NULL COMMENT '日志日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  INDEX idx_internship_id (internship_id),
  INDEX idx_log_date (log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实习日志表';

-- 10. 创建实习文件表
-- ============================================

CREATE TABLE internship_files (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
  internship_id INT NOT NULL COMMENT '实习记录ID',
  file_name VARCHAR(255) NOT NULL COMMENT '文件名',
  file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
  file_size INT NOT NULL COMMENT '文件大小(字节)',
  file_type VARCHAR(50) COMMENT '文件类型',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  INDEX idx_internship_id (internship_id),
  INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实习文件表';

-- 11. 创建通知表
-- ============================================

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
  user_id INT NOT NULL COMMENT '用户ID',
  title VARCHAR(200) NOT NULL COMMENT '通知标题',
  content TEXT NOT NULL COMMENT '通知内容',
  type VARCHAR(50) COMMENT '通知类型',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 12. 创建操作日志表
-- ============================================

CREATE TABLE operation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  user_id INT COMMENT '操作用户ID',
  operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
  operation_desc TEXT COMMENT '操作描述',
  ip_address VARCHAR(50) COMMENT 'IP地址',
  user_agent VARCHAR(500) COMMENT '用户代理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_operation_type (operation_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================
-- 插入测试数据
-- ============================================

-- 注意: 密码都是 'password123' 的 bcrypt 哈希值
-- 实际使用时应该通过应用程序的注册接口创建用户

-- 插入测试用户
INSERT INTO users (username, password_hash, role, email, phone, real_name) VALUES
('student1', '$2b$10$YourBcryptHashHere1', 'student', 'student1@example.com', '13800138001', '张三'),
('student2', '$2b$10$YourBcryptHashHere2', 'student', 'student2@example.com', '13800138002', '李四'),
('student3', '$2b$10$YourBcryptHashHere3', 'student', 'student3@example.com', '13800138003', '王五'),
('teacher1', '$2b$10$YourBcryptHashHere4', 'teacher', 'teacher1@example.com', '13900139001', '李老师'),
('teacher2', '$2b$10$YourBcryptHashHere5', 'teacher', 'teacher2@example.com', '13900139002', '王老师'),
('enterprise1', '$2b$10$YourBcryptHashHere6', 'enterprise', 'hr1@company1.com', '13700137001', '人力资源部'),
('enterprise2', '$2b$10$YourBcryptHashHere7', 'enterprise', 'hr2@company2.com', '13700137002', '招聘专员');


-- 插入学生信息
INSERT INTO students (user_id, student_number, major, grade, class_name) VALUES
(1, '2021001', '计算机科学与技术', 2021, '计科1班'),
(2, '2021002', '软件工程', 2021, '软工1班'),
(3, '2022001', '信息管理与信息系统', 2022, '信管1班');

-- 插入教师信息
INSERT INTO teachers (user_id, teacher_number, department, title) VALUES
(4, 'T001', '计算机学院', '副教授'),
(5, 'T002', '软件学院', '讲师');

-- 插入企业信息
INSERT INTO enterprises (user_id, company_name, industry, address, website) VALUES
(6, '科技创新有限公司', '互联网', '北京市朝阳区科技园', 'https://www.tech-company1.com'),
(7, '智能软件股份有限公司', '软件开发', '上海市浦东新区软件园', 'https://www.software-company2.com');

-- 插入实习岗位
INSERT INTO positions (enterprise_id, title, description, requirements, total_slots, available_slots, start_date, end_date, status) VALUES
(1, '前端开发实习生', 
'负责公司产品的前端页面开发，参与需求分析和技术方案设计。工作内容包括：\n1. 使用Vue.js开发前端页面\n2. 与后端工程师协作完成接口对接\n3. 优化页面性能和用户体验\n4. 参与代码评审和技术分享', 
'1. 熟悉HTML/CSS/JavaScript基础\n2. 了解Vue.js或React框架\n3. 有良好的团队协作精神\n4. 学习能力强，能快速适应新技术', 
5, 5, '2024-03-01', '2024-06-30', 'open'),

(1, '后端开发实习生', 
'参与公司后端系统的开发和维护，负责API接口设计和实现。工作内容包括：\n1. 使用Node.js/Java开发后端服务\n2. 设计和优化数据库结构\n3. 编写单元测试和接口文档\n4. 参与系统架构设计', 
'1. 熟悉至少一门后端语言（Node.js/Java/Python）\n2. 了解数据库基础知识（MySQL/MongoDB）\n3. 了解RESTful API设计\n4. 有责任心，注重代码质量', 
3, 3, '2024-03-15', '2024-07-15', 'open'),

(2, 'UI/UX设计实习生', 
'协助设计团队完成产品界面设计和用户体验优化。工作内容包括：\n1. 参与产品原型设计\n2. 制作高保真设计稿\n3. 配合开发团队完成设计落地\n4. 参与用户调研和可用性测试', 
'1. 熟练使用Figma/Sketch等设计工具\n2. 有良好的审美能力和创意思维\n3. 了解基本的交互设计原则\n4. 有作品集优先', 
2, 2, '2024-04-01', '2024-07-31', 'open'),

(2, '测试工程师实习生', 
'参与软件测试工作，保证产品质量。工作内容包括：\n1. 编写测试用例\n2. 执行功能测试和回归测试\n3. 提交和跟踪bug\n4. 参与自动化测试脚本编写', 
'1. 细心认真，有耐心\n2. 了解软件测试基础知识\n3. 熟悉至少一种编程语言\n4. 有自动化测试经验优先', 
4, 4, '2024-03-20', '2024-07-20', 'open');

-- ============================================
-- 创建视图（可选）
-- ============================================

-- 学生申请统计视图
CREATE OR REPLACE VIEW v_student_application_stats AS
SELECT 
  s.id AS student_id,
  s.student_number,
  u.real_name,
  s.major,
  COUNT(a.id) AS total_applications,
  SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
  SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.student_number, u.real_name, s.major;

-- 企业岗位统计视图
CREATE OR REPLACE VIEW v_enterprise_position_stats AS
SELECT 
  e.id AS enterprise_id,
  e.company_name,
  e.industry,
  COUNT(p.id) AS total_positions,
  SUM(CASE WHEN p.status = 'open' THEN 1 ELSE 0 END) AS open_positions,
  SUM(p.total_slots) AS total_slots,
  SUM(p.available_slots) AS available_slots,
  COUNT(DISTINCT a.id) AS total_applications,
  COUNT(DISTINCT i.id) AS total_internships
FROM enterprises e
LEFT JOIN positions p ON e.id = p.enterprise_id
LEFT JOIN applications a ON p.id = a.position_id
LEFT JOIN internships i ON e.id = i.enterprise_id
GROUP BY e.id, e.company_name, e.industry;


-- 实习进度统计视图
CREATE OR REPLACE VIEW v_internship_progress AS
SELECT 
  i.id AS internship_id,
  i.student_id,
  u.real_name AS student_name,
  s.student_number,
  e.company_name,
  p.title AS position_title,
  i.start_date,
  i.end_date,
  i.status,
  DATEDIFF(CURDATE(), i.start_date) AS days_completed,
  DATEDIFF(i.end_date, i.start_date) AS total_days,
  ROUND(DATEDIFF(CURDATE(), i.start_date) / DATEDIFF(i.end_date, i.start_date) * 100, 2) AS progress_percentage,
  i.teacher_score,
  i.enterprise_score,
  i.final_score
FROM internships i
JOIN students s ON i.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN enterprises e ON i.enterprise_id = e.id
JOIN positions p ON i.position_id = p.id;

-- ============================================
-- 创建存储过程
-- ============================================

-- 存储过程：更新岗位状态
DELIMITER //

CREATE PROCEDURE sp_update_position_status(IN p_position_id INT)
BEGIN
  DECLARE v_available_slots INT;
  
  SELECT available_slots INTO v_available_slots
  FROM positions
  WHERE id = p_position_id;
  
  IF v_available_slots = 0 THEN
    UPDATE positions SET status = 'full' WHERE id = p_position_id;
  ELSEIF v_available_slots > 0 THEN
    UPDATE positions SET status = 'open' WHERE id = p_position_id;
  END IF;
END //

DELIMITER ;

-- 存储过程：批准申请并创建实习记录
DELIMITER //

CREATE PROCEDURE sp_approve_application(
  IN p_application_id INT,
  IN p_teacher_id INT
)
BEGIN
  DECLARE v_student_id INT;
  DECLARE v_position_id INT;
  DECLARE v_enterprise_id INT;
  DECLARE v_start_date DATE;
  DECLARE v_end_date DATE;
  DECLARE v_available_slots INT;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '批准申请失败';
  END;
  
  START TRANSACTION;
  
  -- 获取申请信息
  SELECT a.student_id, a.position_id, p.enterprise_id, p.start_date, p.end_date, p.available_slots
  INTO v_student_id, v_position_id, v_enterprise_id, v_start_date, v_end_date, v_available_slots
  FROM applications a
  JOIN positions p ON a.position_id = p.id
  WHERE a.id = p_application_id AND a.status = 'pending';
  
  -- 检查名额
  IF v_available_slots <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '岗位名额已满';
  END IF;
  
  -- 更新申请状态
  UPDATE applications 
  SET status = 'approved', 
      reviewed_at = NOW(), 
      reviewed_by = p_teacher_id
  WHERE id = p_application_id;
  
  -- 创建实习记录
  INSERT INTO internships (
    application_id, student_id, position_id, enterprise_id, teacher_id,
    start_date, end_date, status
  ) VALUES (
    p_application_id, v_student_id, v_position_id, v_enterprise_id, p_teacher_id,
    v_start_date, v_end_date, 'ongoing'
  );
  
  -- 减少可用名额
  UPDATE positions 
  SET available_slots = available_slots - 1
  WHERE id = v_position_id;
  
  -- 更新岗位状态
  CALL sp_update_position_status(v_position_id);
  
  COMMIT;
END //

DELIMITER ;


-- 存储过程：计算综合评分
DELIMITER //

CREATE PROCEDURE sp_calculate_final_score(IN p_internship_id INT)
BEGIN
  DECLARE v_teacher_score DECIMAL(5,2);
  DECLARE v_enterprise_score DECIMAL(5,2);
  DECLARE v_final_score DECIMAL(5,2);
  
  SELECT teacher_score, enterprise_score
  INTO v_teacher_score, v_enterprise_score
  FROM internships
  WHERE id = p_internship_id;
  
  IF v_teacher_score IS NOT NULL AND v_enterprise_score IS NOT NULL THEN
    SET v_final_score = (v_teacher_score * 0.5 + v_enterprise_score * 0.5);
    
    UPDATE internships
    SET final_score = v_final_score,
        status = 'completed'
    WHERE id = p_internship_id;
  END IF;
END //

DELIMITER ;

-- 存储过程：更新过期实习状态
DELIMITER //

CREATE PROCEDURE sp_update_expired_internships()
BEGIN
  UPDATE internships
  SET status = 'pending_evaluation'
  WHERE status = 'ongoing' 
    AND end_date < CURDATE();
END //

DELIMITER ;

-- ============================================
-- 创建触发器
-- ============================================

-- 触发器：申请批准后自动发送通知
DELIMITER //

CREATE TRIGGER tr_application_approved_notification
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- 通知学生
    INSERT INTO notifications (user_id, title, content, type)
    SELECT u.id, '申请已批准', 
           CONCAT('您的实习申请已被批准，实习记录已创建。'), 
           'application_approved'
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = NEW.student_id;
    
    -- 通知企业
    INSERT INTO notifications (user_id, title, content, type)
    SELECT u.id, '新实习生', 
           CONCAT('您有新的实习生加入。'), 
           'new_intern'
    FROM positions p
    JOIN enterprises e ON p.enterprise_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE p.id = NEW.position_id;
  END IF;
  
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- 通知学生
    INSERT INTO notifications (user_id, title, content, type)
    SELECT u.id, '申请已拒绝', 
           CONCAT('您的实习申请已被拒绝。原因：', IFNULL(NEW.rejection_reason, '未说明')), 
           'application_rejected'
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = NEW.student_id;
  END IF;
END //

DELIMITER ;


-- 触发器：评价提交后计算综合评分
DELIMITER //

CREATE TRIGGER tr_calculate_score_after_evaluation
AFTER UPDATE ON internships
FOR EACH ROW
BEGIN
  IF (NEW.teacher_score IS NOT NULL AND OLD.teacher_score IS NULL) OR
     (NEW.enterprise_score IS NOT NULL AND OLD.enterprise_score IS NULL) THEN
    
    IF NEW.teacher_score IS NOT NULL AND NEW.enterprise_score IS NOT NULL THEN
      CALL sp_calculate_final_score(NEW.id);
    END IF;
  END IF;
END //

DELIMITER ;

-- ============================================
-- 创建事件调度器（定时任务）
-- ============================================

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 事件：每天凌晨2点更新过期实习状态
CREATE EVENT IF NOT EXISTS evt_update_expired_internships
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO
  CALL sp_update_expired_internships();

-- 事件：每天凌晨3点发送实习到期提醒（7天内到期）
DELIMITER //

CREATE EVENT IF NOT EXISTS evt_send_expiring_reminders
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 3 HOUR)
DO
BEGIN
  -- 提醒学生
  INSERT INTO notifications (user_id, title, content, type)
  SELECT u.id, '实习即将到期', 
         CONCAT('您的实习将在', DATEDIFF(i.end_date, CURDATE()), '天后到期，请及时完成实习任务。'),
         'internship_expiring'
  FROM internships i
  JOIN students s ON i.student_id = s.id
  JOIN users u ON s.user_id = u.id
  WHERE i.status = 'ongoing'
    AND DATEDIFF(i.end_date, CURDATE()) BETWEEN 1 AND 7
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = u.id
        AND n.type = 'internship_expiring'
        AND DATE(n.created_at) = CURDATE()
    );
  
  -- 提醒教师
  INSERT INTO notifications (user_id, title, content, type)
  SELECT u.id, '学生实习即将到期', 
         CONCAT('您指导的学生实习即将到期，请关注实习进度。'),
         'internship_expiring'
  FROM internships i
  JOIN teachers t ON i.teacher_id = t.id
  JOIN users u ON t.user_id = u.id
  WHERE i.status = 'ongoing'
    AND DATEDIFF(i.end_date, CURDATE()) BETWEEN 1 AND 7
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = u.id
        AND n.type = 'internship_expiring'
        AND DATE(n.created_at) = CURDATE()
    );
END //

DELIMITER ;

-- ============================================
-- 创建索引优化查询性能
-- ============================================

-- 复合索引优化常见查询
CREATE INDEX idx_applications_student_status ON applications(student_id, status);
CREATE INDEX idx_applications_position_status ON applications(position_id, status);
CREATE INDEX idx_internships_student_status ON internships(student_id, status);
CREATE INDEX idx_internships_enterprise_status ON internships(enterprise_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ============================================
-- 数据库用户和权限设置
-- ============================================

-- 创建应用程序数据库用户
CREATE USER IF NOT EXISTS 'internship_user'@'localhost' 
  IDENTIFIED BY 'your_strong_password_here';

-- 授予权限
GRANT SELECT, INSERT, UPDATE, DELETE ON internship_management.* 
  TO 'internship_user'@'localhost';

-- 授予存储过程执行权限
GRANT EXECUTE ON internship_management.* 
  TO 'internship_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;


-- ============================================
-- 数据库备份和恢复说明
-- ============================================

/*
备份数据库：
mysqldump -u root -p internship_management > backup_$(date +%Y%m%d).sql

备份数据库（压缩）：
mysqldump -u root -p internship_management | gzip > backup_$(date +%Y%m%d).sql.gz

恢复数据库：
mysql -u root -p internship_management < backup_20240115.sql

恢复数据库（从压缩文件）：
gunzip < backup_20240115.sql.gz | mysql -u root -p internship_management
*/

-- ============================================
-- 性能优化建议
-- ============================================

/*
1. 定期分析和优化表：
   ANALYZE TABLE users, students, teachers, enterprises, positions, applications, internships;
   OPTIMIZE TABLE users, students, teachers, enterprises, positions, applications, internships;

2. 监控慢查询：
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   
3. 查看慢查询日志：
   SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

4. 查看表状态：
   SHOW TABLE STATUS FROM internship_management;

5. 查看索引使用情况：
   SHOW INDEX FROM applications;
   
6. 分析查询执行计划：
   EXPLAIN SELECT * FROM applications WHERE student_id = 1 AND status = 'pending';
*/

-- ============================================
-- 常用查询示例
-- ============================================

-- 1. 查询学生的所有申请
/*
SELECT 
  a.id,
  a.status,
  a.applied_at,
  p.title AS position_title,
  e.company_name,
  p.start_date,
  p.end_date
FROM applications a
JOIN positions p ON a.position_id = p.id
JOIN enterprises e ON p.enterprise_id = e.id
WHERE a.student_id = 1
ORDER BY a.applied_at DESC;
*/

-- 2. 查询企业的所有岗位及申请情况
/*
SELECT 
  p.id,
  p.title,
  p.total_slots,
  p.available_slots,
  p.status,
  COUNT(a.id) AS application_count,
  SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_count
FROM positions p
LEFT JOIN applications a ON p.id = a.position_id
WHERE p.enterprise_id = 1
GROUP BY p.id, p.title, p.total_slots, p.available_slots, p.status
ORDER BY p.created_at DESC;
*/

-- 3. 查询教师需要审批的申请
/*
SELECT 
  a.id,
  a.applied_at,
  s.student_number,
  u.real_name AS student_name,
  s.major,
  p.title AS position_title,
  e.company_name,
  a.personal_statement
FROM applications a
JOIN students s ON a.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN positions p ON a.position_id = p.id
JOIN enterprises e ON p.enterprise_id = e.id
WHERE a.status = 'pending'
  AND (a.teacher_id = 1 OR a.teacher_id IS NULL)
ORDER BY a.applied_at ASC;
*/

-- 4. 查询实习进度统计
/*
SELECT 
  i.id,
  u.real_name AS student_name,
  e.company_name,
  p.title AS position_title,
  i.start_date,
  i.end_date,
  i.status,
  DATEDIFF(CURDATE(), i.start_date) AS days_completed,
  DATEDIFF(i.end_date, i.start_date) AS total_days,
  ROUND(DATEDIFF(CURDATE(), i.start_date) / DATEDIFF(i.end_date, i.start_date) * 100, 2) AS progress_percentage,
  (SELECT COUNT(*) FROM internship_logs WHERE internship_id = i.id) AS log_count,
  (SELECT COUNT(*) FROM internship_files WHERE internship_id = i.id) AS file_count
FROM internships i
JOIN students s ON i.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN enterprises e ON i.enterprise_id = e.id
JOIN positions p ON i.position_id = p.id
WHERE i.status = 'ongoing'
ORDER BY progress_percentage DESC;
*/

-- 5. 统计数据概览
/*
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
  (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS total_teachers,
  (SELECT COUNT(*) FROM users WHERE role = 'enterprise') AS total_enterprises,
  (SELECT COUNT(*) FROM positions WHERE status = 'open') AS open_positions,
  (SELECT COUNT(*) FROM applications WHERE status = 'pending') AS pending_applications,
  (SELECT COUNT(*) FROM internships WHERE status = 'ongoing') AS ongoing_internships,
  (SELECT COUNT(*) FROM internships WHERE status = 'completed') AS completed_internships,
  (SELECT ROUND(AVG(final_score), 2) FROM internships WHERE final_score IS NOT NULL) AS average_score;
*/

-- ============================================
-- 数据库架构完成
-- ============================================

-- 显示所有表
SHOW TABLES;

-- 显示数据库信息
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Data Size (MB)',
  ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS 'Index Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'internship_management'
ORDER BY DATA_LENGTH DESC;

-- 架构创建完成
SELECT 'Database schema created successfully!' AS Status;

