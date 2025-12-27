-- ============================================
-- 高校实习管理系统 - 测试数据插入脚本
-- ============================================
-- 版本: 1.0.0
-- 创建日期: 2024-01-15
-- 说明: 插入完整的测试数据，包括用户、岗位、申请、实习记录等
-- ============================================

USE internship_management;

-- 清空现有数据（谨慎使用）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE operation_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE internship_files;
TRUNCATE TABLE internship_logs;
TRUNCATE TABLE internships;
TRUNCATE TABLE applications;
TRUNCATE TABLE positions;
TRUNCATE TABLE enterprises;
TRUNCATE TABLE teachers;
TRUNCATE TABLE students;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. 插入用户数据
-- ============================================
-- 密码都是 'password123' 的 bcrypt 哈希值
-- 实际密码: password123

INSERT INTO users (username, password_hash, role, email, phone, real_name) VALUES
-- 学生用户 (15个)
('student001', '123456', 'student', 'zhangsan@student.edu.cn', '13800138001', '张三'),
('student002', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'lisi@student.edu.cn', '13800138002', '李四'),
('student003', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'wangwu@student.edu.cn', '13800138003', '王五'),
('student004', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'zhaoliu@student.edu.cn', '13800138004', '赵六'),
('student005', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'sunqi@student.edu.cn', '13800138005', '孙七'),
('student006', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'zhouba@student.edu.cn', '13800138006', '周八'),
('student007', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'wujiu@student.edu.cn', '13800138007', '吴九'),
('student008', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'zhengshi@student.edu.cn', '13800138008', '郑十'),
('student009', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'chenyi@student.edu.cn', '13800138009', '陈一'),
('student010', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'liuer@student.edu.cn', '13800138010', '刘二')
,
('student011', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'huangsan@student.edu.cn', '13800138011', '黄三'),
('student012', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'linsi@student.edu.cn', '13800138012', '林四'),
('student013', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'hexu@student.edu.cn', '13800138013', '何五'),
('student014', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'gaoliu@student.edu.cn', '13800138014', '高六'),
('student015', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'student', 'guoqi@student.edu.cn', '13800138015', '郭七'),
-- 教师用户 (8个)
('teacher001', '123456', 'teacher', 'liteacher@university.edu.cn', '13900139001', '李教授'),
('teacher002', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'wangteacher@university.edu.cn', '13900139002', '王副教授'),
('teacher003', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'zhangteacher@university.edu.cn', '13900139003', '张讲师'),
('teacher004', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'zhaoteacher@university.edu.cn', '13900139004', '赵老师'),
('teacher005', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'chenteacher@university.edu.cn', '13900139005', '陈教授'),
('teacher006', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'liuteacher@university.edu.cn', '13900139006', '刘副教授'),
('teacher007', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'yangteacher@university.edu.cn', '13900139007', '杨讲师'),
('teacher008', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'teacher', 'xuteacher@university.edu.cn', '13900139008', '徐老师'),
-- 企业用户 (10个)
('enterprise001', '123456', 'enterprise', 'hr@alibaba.com', '13700137001', '阿里巴巴HR'),
('enterprise002', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@tencent.com', '13700137002', '腾讯招聘'),
('enterprise003', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@baidu.com', '13700137003', '百度人力'),
('enterprise004', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@bytedance.com', '13700137004', '字节跳动HR'),
('enterprise005', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@huawei.com', '13700137005', '华为招聘'),
('enterprise006', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@jd.com', '13700137006', '京东人力'),
('enterprise007', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@meituan.com', '13700137007', '美团招聘'),
('enterprise008', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@didi.com', '13700137008', '滴滴HR'),
('enterprise009', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@xiaomi.com', '13700137009', '小米人力'),
('enterprise010', '$2b$10$rKvVLZ8JQhXjGGGvz5YZ0.kqF5xGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'enterprise', 'hr@netease.com', '13700137010', '网易招聘');

-- ============================================
-- 2. 插入学生信息
-- ============================================

INSERT INTO students (user_id, student_number, major, grade, class_name) VALUES
(1, '2021001001', '计算机科学与技术', 2021, '计科1班'),
(2, '2021001002', '计算机科学与技术', 2021, '计科1班'),
(3, '2021002001', '软件工程', 2021, '软工1班'),
(4, '2021002002', '软件工程', 2021, '软工1班'),
(5, '2021003001', '信息管理与信息系统', 2021, '信管1班'),
(6, '2022001001', '计算机科学与技术', 2022, '计科2班'),
(7, '2022001002', '计算机科学与技术', 2022, '计科2班'),
(8, '2022002001', '软件工程', 2022, '软工2班'),
(9, '2022003001', '数据科学与大数据技术', 2022, '数据1班'),
(10, '2022003002', '数据科学与大数据技术', 2022, '数据1班'),
(11, '2023001001', '人工智能', 2023, 'AI1班'),
(12, '2023001002', '人工智能', 2023, 'AI1班'),
(13, '2023002001', '网络工程', 2023, '网工1班'),
(14, '2023003001', '物联网工程', 2023, '物联1班'),
(15, '2023004001', '电子商务', 2023, '电商1班');

-- ============================================
-- 3. 插入教师信息
-- ============================================

INSERT INTO teachers (user_id, teacher_number, department, title) VALUES
(16, 'T2020001', '计算机学院', '教授'),
(17, 'T2019002', '计算机学院', '副教授'),
(18, 'T2021003', '软件学院', '讲师'),
(19, 'T2020004', '软件学院', '副教授'),
(20, 'T2018005', '信息学院', '教授'),
(21, 'T2019006', '信息学院', '副教授'),
(22, 'T2022007', '人工智能学院', '讲师'),
(23, 'T2021008', '网络学院', '副教授');

-- ============================================
-- 4. 插入企业信息
-- ============================================

INSERT INTO enterprises (user_id, company_name, industry, address, website) VALUES
(24, '阿里巴巴集团', '互联网/电子商务', '浙江省杭州市余杭区文一西路969号', 'https://www.alibaba.com'),
(25, '腾讯科技有限公司', '互联网/社交媒体', '广东省深圳市南山区科技园', 'https://www.tencent.com'),
(26, '百度在线网络技术有限公司', '互联网/人工智能', '北京市海淀区上地十街10号', 'https://www.baidu.com'),
(27, '北京字节跳动科技有限公司', '互联网/短视频', '北京市海淀区知春路甲48号', 'https://www.bytedance.com'),
(28, '华为技术有限公司', '通信设备/软件', '广东省深圳市龙岗区坂田华为基地', 'https://www.huawei.com'),
(29, '京东集团', '互联网/电子商务', '北京市大兴区亦庄经济开发区', 'https://www.jd.com'),
(30, '美团', '互联网/本地生活', '北京市朝阳区望京东路6号', 'https://www.meituan.com'),
(31, '滴滴出行科技有限公司', '互联网/出行服务', '北京市海淀区中关村软件园', 'https://www.didiglobal.com'),
(32, '小米科技有限责任公司', '智能硬件/互联网', '北京市海淀区清河中街68号', 'https://www.mi.com'),
(33, '网易集团', '互联网/游戏', '浙江省杭州市滨江区长河路590号', 'https://www.163.com');

-- ============================================
-- 5. 插入实习岗位
-- ============================================

INSERT INTO positions (enterprise_id, title, description, requirements, total_slots, available_slots, start_date, end_date, status) VALUES
-- 阿里巴巴岗位
(1, 'Java后端开发实习生', 
'参与阿里云产品后端开发，负责微服务架构设计与实现。
工作内容：
1. 参与分布式系统开发
2. 编写高质量代码和单元测试
3. 参与技术方案设计和评审
4. 学习阿里技术栈和最佳实践', 
'要求：
1. 熟悉Java编程，了解Spring Boot/Spring Cloud
2. 了解MySQL、Redis等数据库
3. 了解分布式系统基础知识
4. 有良好的学习能力和团队协作精神
5. 本科及以上学历，计算机相关专业', 
8, 5, '2024-03-01', '2024-08-31', 'open'),

(1, '前端开发实习生（React方向）', 
'参与淘宝/天猫前端页面开发，打造极致用户体验。
工作内容：
1. 使用React开发电商前端页面
2. 优化页面性能和加载速度
3. 参与组件库建设
4. 跨端开发经验积累', 
'要求：
1. 熟悉HTML/CSS/JavaScript
2. 了解React或Vue框架
3. 了解前端工程化工具
4. 对用户体验有追求
5. 有作品或项目经验优先', 
6, 3, '2024-03-15', '2024-08-31', 'open'),

-- 腾讯岗位
(2, '微信小程序开发实习生', 
'参与微信生态产品开发，负责小程序功能实现。
工作内容：
1. 开发微信小程序功能模块
2. 优化小程序性能
3. 对接后端API接口
4. 参与产品需求讨论', 
'要求：
1. 熟悉JavaScript/TypeScript
2. 了解微信小程序开发框架
3. 有小程序开发经验优先
4. 学习能力强，善于沟通
5. 每周至少实习4天', 
5, 2, '2024-04-01', '2024-09-30', 'open'),

(2, '后台开发实习生（C++方向）', 
'参与腾讯游戏/社交后台系统开发。
工作内容：
1. 使用C++开发高性能后台服务
2. 参与系统架构设计
3. 性能优化和问题排查
4. 参与代码评审', 
'要求：
1. 熟悉C++编程
2. 了解Linux系统和网络编程
3. 了解数据结构和算法
4. 有责任心，代码质量意识强
5. 985/211院校优先', 
4, 4, '2024-03-20', '2024-09-20', 'open')
,
-- 百度岗位
(3, 'AI算法实习生', 
'参与百度AI产品算法研发，涉及NLP、CV等方向。
工作内容：
1. 参与深度学习模型训练
2. 算法优化和调参
3. 论文阅读和复现
4. 参与AI产品落地', 
'要求：
1. 熟悉Python，了解深度学习框架（PyTorch/TensorFlow）
2. 有机器学习/深度学习基础
3. 了解常见算法和模型
4. 有相关项目或竞赛经验优先
5. 研究生优先', 
3, 1, '2024-04-15', '2024-10-15', 'open'),

(3, '搜索引擎开发实习生', 
'参与百度搜索核心技术研发。
工作内容：
1. 搜索算法优化
2. 索引系统开发
3. 相关性排序研究
4. 大数据处理', 
'要求：
1. 熟悉Java或C++
2. 了解搜索引擎原理
3. 了解数据结构和算法
4. 有大数据处理经验优先
5. 本科及以上，计算机相关专业', 
4, 4, '2024-03-10', '2024-09-10', 'open'),

-- 字节跳动岗位
(4, '抖音推荐算法实习生', 
'参与抖音推荐系统研发，优化用户体验。
工作内容：
1. 推荐算法开发和优化
2. 特征工程
3. A/B测试分析
4. 模型效果评估', 
'要求：
1. 熟悉Python，了解机器学习
2. 了解推荐系统原理
3. 有数据分析能力
4. 有推荐系统经验优先
5. 对短视频产品有热情', 
5, 3, '2024-04-01', '2024-10-01', 'open'),

(4, '全栈开发实习生', 
'参与字节跳动内部系统开发。
工作内容：
1. 前后端全栈开发
2. 系统架构设计
3. 数据库设计和优化
4. 参与产品迭代', 
'要求：
1. 熟悉前端框架（React/Vue）和后端语言（Node.js/Go）
2. 了解数据库和缓存
3. 有全栈项目经验
4. 学习能力强，能快速上手
5. 每周至少实习3天', 
6, 6, '2024-03-25', '2024-09-25', 'open'),

-- 华为岗位
(5, '鸿蒙系统开发实习生', 
'参与鸿蒙操作系统开发。
工作内容：
1. 系统底层开发
2. 驱动程序开发
3. 性能优化
4. 系统测试', 
'要求：
1. 熟悉C/C++编程
2. 了解操作系统原理
3. 了解Linux内核
4. 有嵌入式开发经验优先
5. 本科及以上，计算机相关专业', 
4, 4, '2024-05-01', '2024-11-01', 'open'),

(5, '云计算开发实习生', 
'参与华为云产品开发。
工作内容：
1. 云平台功能开发
2. 容器化部署
3. 微服务架构实践
4. DevOps流程优化', 
'要求：
1. 熟悉Java/Go/Python
2. 了解Docker、Kubernetes
3. 了解云计算基础知识
4. 有云平台使用经验优先
5. 学习能力强', 
5, 5, '2024-04-10', '2024-10-10', 'open')
,
-- 京东岗位
(6, '电商平台开发实习生', 
'参与京东商城系统开发。
工作内容：
1. 电商业务系统开发
2. 订单系统优化
3. 支付系统对接
4. 高并发场景处理', 
'要求：
1. 熟悉Java，了解Spring全家桶
2. 了解分布式系统
3. 了解消息队列（Kafka/RocketMQ）
4. 有电商项目经验优先
5. 能承受一定工作压力', 
6, 6, '2024-03-15', '2024-09-15', 'open'),

(6, '数据分析实习生', 
'参与京东大数据分析工作。
工作内容：
1. 用户行为数据分析
2. 销售数据报表制作
3. 数据可视化
4. 业务洞察挖掘', 
'要求：
1. 熟悉SQL，了解Python
2. 了解数据分析方法
3. 熟悉Excel、Tableau等工具
4. 有数据分析项目经验优先
5. 逻辑思维能力强', 
4, 4, '2024-04-01', '2024-10-01', 'open'),

-- 美团岗位
(7, '外卖配送算法实习生', 
'参与美团配送调度算法优化。
工作内容：
1. 配送路径规划算法
2. 订单分配优化
3. 时间预估模型
4. 算法效果评估', 
'要求：
1. 熟悉算法和数据结构
2. 了解运筹优化
3. 熟悉Python或C++
4. 有算法竞赛经验优先
5. 对O2O业务感兴趣', 
3, 3, '2024-04-20', '2024-10-20', 'open'),

(7, 'iOS开发实习生', 
'参与美团App iOS端开发。
工作内容：
1. iOS功能模块开发
2. UI界面优化
3. 性能优化
4. Bug修复', 
'要求：
1. 熟悉Swift或Objective-C
2. 了解iOS开发框架
3. 有iOS项目经验
4. 注重代码质量
5. 有上架App经验优先', 
3, 3, '2024-03-20', '2024-09-20', 'open'),

-- 滴滴岗位
(8, '地图导航算法实习生', 
'参与滴滴地图和导航算法研发。
工作内容：
1. 路径规划算法
2. ETA预估优化
3. 地图数据处理
4. 算法性能优化', 
'要求：
1. 熟悉算法和数据结构
2. 了解图论算法
3. 熟悉C++或Java
4. 有GIS相关经验优先
5. 本科及以上', 
4, 4, '2024-04-05', '2024-10-05', 'open'),

(8, 'Android开发实习生', 
'参与滴滴App Android端开发。
工作内容：
1. Android功能开发
2. 性能优化
3. 适配各种机型
4. 用户体验优化', 
'要求：
1. 熟悉Java/Kotlin
2. 了解Android开发框架
3. 有Android项目经验
4. 熟悉常用第三方库
5. 每周至少实习4天', 
4, 4, '2024-03-18', '2024-09-18', 'open')
,
-- 小米岗位
(9, 'MIUI系统开发实习生', 
'参与MIUI系统功能开发。
工作内容：
1. Android系统定制开发
2. 系统应用开发
3. 性能优化
4. 用户反馈处理', 
'要求：
1. 熟悉Java/Kotlin
2. 了解Android系统框架
3. 有AOSP开发经验优先
4. 对手机系统感兴趣
5. 本科及以上', 
5, 5, '2024-04-10', '2024-10-10', 'open'),

(9, 'IoT智能硬件开发实习生', 
'参与小米IoT产品开发。
工作内容：
1. 智能硬件固件开发
2. 设备联网协议开发
3. 米家App对接
4. 设备测试', 
'要求：
1. 熟悉C/C++
2. 了解嵌入式开发
3. 了解物联网协议（MQTT等）
4. 有硬件开发经验优先
5. 对智能硬件感兴趣', 
4, 4, '2024-03-25', '2024-09-25', 'open'),

-- 网易岗位
(10, '游戏客户端开发实习生', 
'参与网易游戏客户端开发。
工作内容：
1. 游戏功能开发
2. UI界面制作
3. 性能优化
4. Bug修复', 
'要求：
1. 熟悉C++或C#
2. 了解Unity或Unreal引擎
3. 有游戏开发经验优先
4. 热爱游戏
5. 有作品展示优先', 
5, 5, '2024-04-15', '2024-10-15', 'open'),

(10, '游戏服务端开发实习生', 
'参与网易游戏服务端开发。
工作内容：
1. 游戏逻辑开发
2. 数据库设计
3. 服务器性能优化
4. 游戏运营支持', 
'要求：
1. 熟悉Java/Go/Python
2. 了解网络编程
3. 了解数据库和缓存
4. 有游戏服务端经验优先
5. 能承受项目压力', 
4, 4, '2024-03-30', '2024-09-30', 'open');

-- ============================================
-- 6. 插入实习申请
-- ============================================

INSERT INTO applications (student_id, position_id, teacher_id, status, personal_statement, contact_info, applied_at, reviewed_at, reviewed_by) VALUES
-- 已批准的申请
(1, 1, 1, 'approved', 
'我是计算机科学与技术专业的学生，对Java后端开发非常感兴趣。在校期间学习了Spring Boot、MySQL等技术，并完成了多个课程项目。希望能在阿里巴巴学习先进的技术和开发经验。', 
'微信：zhangsan123, QQ：123456789', 
'2024-02-15 10:30:00', '2024-02-20 14:20:00', 1),

(2, 2, 1, 'approved', 
'我热爱前端开发，熟悉React框架，有个人项目经验。希望能参与淘宝前端开发，提升自己的技术水平。', 
'微信：lisi456, 邮箱：lisi@student.edu.cn', 
'2024-02-16 09:15:00', '2024-02-21 10:30:00', 1),

(3, 3, 2, 'approved', 
'我对微信小程序开发很感兴趣，开发过多个小程序项目。希望能在腾讯深入学习小程序技术。', 
'手机：13800138003', 
'2024-02-18 14:20:00', '2024-02-23 16:00:00', 2),

(4, 5, 2, 'approved', 
'我对人工智能和深度学习非常感兴趣，学习过机器学习课程，熟悉Python和PyTorch。希望能在百度AI团队学习实践。', 
'微信：zhaoliu789, QQ：987654321', 
'2024-02-20 11:00:00', '2024-02-25 09:30:00', 2),

(5, 7, 3, 'approved', 
'我是软件工程专业学生，对推荐系统算法很感兴趣，有数据分析和机器学习基础。希望能参与抖音推荐系统研发。', 
'邮箱：sunqi@student.edu.cn', 
'2024-02-22 15:30:00', '2024-02-27 11:00:00', 3),

(6, 11, 3, 'approved', 
'我对电商系统开发很感兴趣，学习了分布式系统和高并发处理。希望能在京东学习电商技术。', 
'微信：zhouba111, 手机：13800138006', 
'2024-02-25 10:00:00', '2024-03-01 14:00:00', 3),

-- 待审批的申请
(7, 4, 2, 'pending', 
'我熟悉C++编程，学习过操作系统和网络编程课程。希望能在腾讯游戏团队实习，提升后台开发能力。', 
'QQ：777888999', 
'2024-03-01 09:00:00', NULL, NULL),

(8, 6, 2, 'pending', 
'我对搜索引擎技术很感兴趣，有扎实的算法基础。希望能在百度搜索团队学习核心技术。', 
'微信：zhengshi222', 
'2024-03-02 10:30:00', NULL, NULL),

(9, 8, 4, 'pending', 
'我是全栈开发爱好者，熟悉前后端技术栈。希望能在字节跳动全面提升开发能力。', 
'邮箱：chenyi@student.edu.cn', 
'2024-03-03 14:00:00', NULL, NULL),

(10, 9, 4, 'pending', 
'我对操作系统开发很感兴趣，有Linux内核学习经验。希望能参与鸿蒙系统开发。', 
'手机：13800138010', 
'2024-03-04 11:20:00', NULL, NULL),

-- 已拒绝的申请
(11, 1, 1, 'rejected', 
'我想学习Java后端开发。', 
'微信：huangsan333', 
'2024-02-28 16:00:00', '2024-03-02 10:00:00', 1),

(12, 5, 2, 'rejected', 
'我对AI感兴趣。', 
'QQ：121212121', 
'2024-03-01 13:00:00', '2024-03-03 15:00:00', 2);

-- ============================================
-- 7. 插入实习记录
-- ============================================

INSERT INTO internships (application_id, student_id, position_id, enterprise_id, teacher_id, start_date, end_date, status, teacher_score, enterprise_score, final_score, teacher_comment, enterprise_comment) VALUES
-- 已完成的实习
(1, 1, 1, 1, 1, '2024-03-01', '2024-06-30', 'completed', 
88.00, 90.00, 89.00, 
'该生在实习期间表现优秀，技术能力强，能够独立完成开发任务。代码质量高，团队协作能力好。', 
'实习生工作认真负责，学习能力强，能快速适应团队开发流程。完成了多个重要功能模块的开发，得到团队一致好评。'),

(2, 2, 2, 1, 1, '2024-03-15', '2024-07-15', 'completed', 
85.00, 87.00, 86.00, 
'该生前端技术扎实，UI实现能力强。在实习期间积极主动，能够提出建设性意见。', 
'实习生对前端技术有深入理解，开发的页面用户体验好。希望继续保持学习热情。'),

-- 进行中的实习
(3, 3, 3, 2, 2, '2024-04-01', '2024-09-30', 'ongoing', 
NULL, NULL, NULL, NULL, NULL),

(4, 4, 5, 3, 2, '2024-04-15', '2024-10-15', 'ongoing', 
NULL, NULL, NULL, NULL, NULL),

(5, 5, 7, 4, 3, '2024-04-01', '2024-10-01', 'ongoing', 
NULL, NULL, NULL, NULL, NULL),

(6, 6, 11, 6, 3, '2024-03-15', '2024-09-15', 'ongoing', 
NULL, NULL, NULL, NULL, NULL);

-- ============================================
-- 8. 插入实习日志
-- ============================================

INSERT INTO internship_logs (internship_id, content, log_date) VALUES
-- 学生1的日志（已完成实习）
(1, '今天是实习第一天，参加了新人培训，了解了公司文化和开发流程。导师给我介绍了团队成员，大家都很友好。下午配置了开发环境，熟悉了代码仓库。', '2024-03-01'),
(1, '开始熟悉项目代码，阅读了核心模块的实现。导师给我讲解了系统架构，学习了微服务的设计思路。下午参加了团队的技术分享会。', '2024-03-04'),
(1, '完成了第一个开发任务：实现用户信息查询接口。学习了Spring Boot的最佳实践，代码通过了Code Review。', '2024-03-08'),
(1, '优化了数据库查询性能，学习了索引优化技巧。参与了需求评审会议，了解了产品设计流程。', '2024-03-15'),
(1, '开发订单管理模块，实现了订单创建、查询、更新等功能。学习了分布式事务处理。', '2024-03-22'),
(1, '参与了系统压测，学习了性能优化方法。修复了几个并发问题的bug。', '2024-04-05'),
(1, '完成了支付接口对接，学习了第三方接口调用和异常处理。代码质量得到了导师的认可。', '2024-04-19'),
(1, '参与了项目重构工作，学习了代码重构的技巧和原则。提升了代码可维护性。', '2024-05-10'),
(1, '开发了数据统计功能，学习了复杂SQL查询和数据分析。完成了实习总结报告。', '2024-06-20'),

-- 学生2的日志（已完成实习）
(2, '第一天报到，熟悉了前端开发环境和工具链。学习了公司的前端开发规范。', '2024-03-15'),
(2, '开始开发商品详情页，学习了React Hooks的高级用法。实现了页面的基本布局。', '2024-03-18'),
(2, '优化了页面加载性能，学习了懒加载和代码分割技术。页面加载速度提升了30%。', '2024-03-25'),
(2, '开发了购物车功能，学习了状态管理和组件通信。完成了交互逻辑的实现。', '2024-04-08'),
(2, '参与了移动端适配工作，学习了响应式设计。完成了多端适配。', '2024-04-22'),
(2, '开发了用户评价组件，学习了组件封装和复用。组件被团队其他项目采用。', '2024-05-15'),
(2, '参与了前端性能优化专项，学习了性能监控和分析工具。提升了整体性能指标。', '2024-06-10'),

-- 学生3的日志（进行中）
(3, '今天开始在腾讯实习，非常激动！参加了新人培训，了解了微信生态。配置了小程序开发环境。', '2024-04-01'),
(3, '学习了微信小程序的开发框架和API。完成了第一个demo小程序，实现了基本的页面跳转和数据展示。', '2024-04-03'),
(3, '开发用户登录功能，学习了微信授权登录流程。实现了用户信息获取和存储。', '2024-04-08'),
(3, '开发商品列表页面，学习了小程序的列表渲染和下拉刷新。优化了数据加载逻辑。', '2024-04-15'),
(3, '对接后端API接口，学习了网络请求封装和错误处理。完成了数据交互功能。', '2024-04-22')
,
-- 学生4的日志（进行中）
(4, '第一天在百度AI实验室报到，参观了实验室，见到了很多AI大牛。配置了深度学习开发环境。', '2024-04-15'),
(4, '学习了PyTorch框架，跑通了第一个图像分类模型。了解了模型训练的基本流程。', '2024-04-17'),
(4, '阅读了BERT论文，学习了Transformer架构。开始复现论文中的实验。', '2024-04-22'),
(4, '参与了NLP项目，学习了文本预处理和特征提取。完成了数据集的准备工作。', '2024-04-29'),

-- 学生5的日志（进行中）
(5, '开始在字节跳动实习，加入了推荐算法团队。了解了抖音推荐系统的整体架构。', '2024-04-01'),
(5, '学习了协同过滤算法，实现了基于用户的推荐。分析了推荐效果指标。', '2024-04-05'),
(5, '学习了深度学习推荐模型，了解了Wide&Deep、DeepFM等模型。开始训练第一个模型。', '2024-04-12'),
(5, '参与了特征工程工作，学习了特征选择和特征组合。提升了模型效果。', '2024-04-20'),

-- 学生6的日志（进行中）
(6, '第一天在京东报到，加入了电商平台开发团队。熟悉了项目代码和业务流程。', '2024-03-15'),
(6, '开发订单查询功能，学习了分页查询和条件筛选。完成了基本功能实现。', '2024-03-18'),
(6, '优化了订单列表的查询性能，学习了数据库索引优化。查询速度提升了50%。', '2024-03-25'),
(6, '开发了订单导出功能，学习了大数据量导出的处理方法。实现了异步导出。', '2024-04-01'),
(6, '参与了促销活动系统开发，学习了高并发场景的处理。实现了库存扣减功能。', '2024-04-15');

-- ============================================
-- 9. 插入实习文件
-- ============================================

INSERT INTO internship_files (internship_id, file_name, file_path, file_size, file_type) VALUES
-- 学生1的文件
(1, '实习周报_第1周.docx', '/uploads/internships/1/weekly_report_week1.docx', 52480, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
(1, '实习周报_第2周.docx', '/uploads/internships/1/weekly_report_week2.docx', 54320, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
(1, '项目代码截图.png', '/uploads/internships/1/code_screenshot.png', 245680, 'image/png'),
(1, '实习总结报告.pdf', '/uploads/internships/1/final_report.pdf', 1024000, 'application/pdf'),
(1, '项目演示PPT.pptx', '/uploads/internships/1/demo_presentation.pptx', 3145728, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),

-- 学生2的文件
(2, '前端开发规范学习笔记.md', '/uploads/internships/2/frontend_standards.md', 15360, 'text/markdown'),
(2, '性能优化报告.pdf', '/uploads/internships/2/performance_report.pdf', 856000, 'application/pdf'),
(2, '组件库文档.docx', '/uploads/internships/2/component_doc.docx', 128000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
(2, '实习总结.pdf', '/uploads/internships/2/internship_summary.pdf', 920000, 'application/pdf'),

-- 学生3的文件
(3, '小程序开发文档.pdf', '/uploads/internships/3/miniprogram_dev_doc.pdf', 512000, 'application/pdf'),
(3, '第一周学习总结.docx', '/uploads/internships/3/week1_summary.docx', 48000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
(3, 'API接口文档.md', '/uploads/internships/3/api_documentation.md', 25600, 'text/markdown'),

-- 学生4的文件
(4, '深度学习论文阅读笔记.pdf', '/uploads/internships/4/paper_notes.pdf', 680000, 'application/pdf'),
(4, '模型训练日志.txt', '/uploads/internships/4/training_log.txt', 102400, 'text/plain'),
(4, '实验结果分析.xlsx', '/uploads/internships/4/experiment_analysis.xlsx', 256000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),

-- 学生5的文件
(5, '推荐算法学习笔记.md', '/uploads/internships/5/recommendation_notes.md', 32768, 'text/markdown'),
(5, '特征工程文档.docx', '/uploads/internships/5/feature_engineering.docx', 96000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),

-- 学生6的文件
(6, '电商系统架构图.png', '/uploads/internships/6/system_architecture.png', 512000, 'image/png'),
(6, '性能优化方案.pdf', '/uploads/internships/6/optimization_plan.pdf', 720000, 'application/pdf'),
(6, '数据库设计文档.docx', '/uploads/internships/6/database_design.docx', 156000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

-- ============================================
-- 10. 插入通知
-- ============================================

INSERT INTO notifications (user_id, title, content, type, is_read, created_at) VALUES
-- 学生通知
(1, '申请已批准', '您申请的"Java后端开发实习生"岗位已被批准，实习记录已创建。请按时参加实习。', 'application_approved', TRUE, '2024-02-20 14:30:00'),
(1, '实习即将开始', '您的实习将在3天后开始，请做好准备。实习地点：浙江省杭州市余杭区文一西路969号', 'internship_reminder', TRUE, '2024-02-27 09:00:00'),
(1, '请提交实习周报', '本周实习周报尚未提交，请及时完成。', 'report_reminder', TRUE, '2024-03-08 10:00:00'),
(1, '实习评价已完成', '您的实习评价已完成，综合评分：89分。感谢您的努力！', 'evaluation_completed', FALSE, '2024-07-05 15:00:00'),

(2, '申请已批准', '您申请的"前端开发实习生（React方向）"岗位已被批准。', 'application_approved', TRUE, '2024-02-21 10:45:00'),
(2, '实习即将到期', '您的实习将在7天后到期，请及时完成实习任务和总结报告。', 'internship_expiring', TRUE, '2024-07-08 09:00:00'),
(2, '实习评价已完成', '您的实习评价已完成，综合评分：86分。', 'evaluation_completed', FALSE, '2024-07-20 16:00:00'),

(3, '申请已批准', '您申请的"微信小程序开发实习生"岗位已被批准。', 'application_approved', TRUE, '2024-02-23 16:15:00'),
(3, '新消息', '您的指导老师发布了新的实习任务，请查看。', 'new_message', FALSE, '2024-04-10 14:00:00'),

(4, '申请已批准', '您申请的"AI算法实习生"岗位已被批准。', 'application_approved', TRUE, '2024-02-25 09:45:00'),
(4, '实习资料审核', '您提交的实习资料已通过审核。', 'document_approved', FALSE, '2024-04-25 11:00:00'),

(5, '申请已批准', '您申请的"抖音推荐算法实习生"岗位已被批准。', 'application_approved', TRUE, '2024-02-27 11:15:00'),

(6, '申请已批准', '您申请的"电商平台开发实习生"岗位已被批准。', 'application_approved', TRUE, '2024-03-01 14:20:00'),

(7, '申请待审核', '您的实习申请已提交，请耐心等待审核。', 'application_submitted', TRUE, '2024-03-01 09:05:00'),

(8, '申请待审核', '您的实习申请已提交，请耐心等待审核。', 'application_submitted', TRUE, '2024-03-02 10:35:00'),

(11, '申请已拒绝', '很抱歉，您申请的"Java后端开发实习生"岗位未通过审核。拒绝原因：个人陈述过于简单，未体现技术能力和项目经验。建议完善简历后重新申请。', 'application_rejected', FALSE, '2024-03-02 10:05:00'),

-- 教师通知
(16, '新的申请待审核', '有新的实习申请需要您审核，请及时处理。', 'new_application', TRUE, '2024-02-15 10:35:00'),
(16, '学生实习即将到期', '您指导的学生张三的实习即将到期，请关注实习进度。', 'internship_expiring', TRUE, '2024-06-23 09:00:00'),
(16, '请完成实习评价', '学生张三的实习已结束，请完成实习评价。', 'evaluation_reminder', FALSE, '2024-07-01 10:00:00'),

(17, '新的申请待审核', '有2个新的实习申请需要您审核。', 'new_application', FALSE, '2024-03-01 09:10:00'),

-- 企业通知
(24, '新实习生', '学生张三已加入您的团队，实习岗位：Java后端开发实习生。', 'new_intern', TRUE, '2024-02-20 14:35:00'),
(24, '新实习生', '学生李四已加入您的团队，实习岗位：前端开发实习生（React方向）。', 'new_intern', TRUE, '2024-02-21 10:50:00'),
(24, '请完成实习评价', '学生张三的实习即将结束，请完成企业评价。', 'evaluation_reminder', FALSE, '2024-06-25 10:00:00'),
(24, '新的岗位申请', '您发布的"Java后端开发实习生"岗位收到新的申请。', 'new_application', FALSE, '2024-03-05 15:00:00'),

(25, '新实习生', '学生王五已加入您的团队，实习岗位：微信小程序开发实习生。', 'new_intern', TRUE, '2024-02-23 16:20:00'),
(25, '岗位名额不足', '您的"微信小程序开发实习生"岗位剩余名额较少，建议及时补充。', 'position_alert', FALSE, '2024-04-10 09:00:00'),

(26, '新实习生', '学生赵六已加入您的团队，实习岗位：AI算法实习生。', 'new_intern', TRUE, '2024-02-25 09:50:00'),

(27, '新实习生', '学生孙七已加入您的团队，实习岗位：抖音推荐算法实习生。', 'new_intern', TRUE, '2024-02-27 11:20:00'),

(29, '新实习生', '学生周八已加入您的团队，实习岗位：电商平台开发实习生。', 'new_intern', TRUE, '2024-03-01 14:25:00');

-- ============================================
-- 11. 插入操作日志
-- ============================================

INSERT INTO operation_logs (user_id, operation_type, operation_desc, ip_address, user_agent, created_at) VALUES
-- 用户登录日志
(1, 'login', '用户登录系统', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-15 08:30:00'),
(1, 'login', '用户登录系统', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-03-01 09:00:00'),
(2, 'login', '用户登录系统', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-02-16 08:45:00'),
(3, 'login', '用户登录系统', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', '2024-02-18 09:15:00'),

-- 申请操作日志
(1, 'create_application', '提交实习申请：Java后端开发实习生', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-15 10:30:00'),
(2, 'create_application', '提交实习申请：前端开发实习生（React方向）', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-02-16 09:15:00'),
(3, 'create_application', '提交实习申请：微信小程序开发实习生', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', '2024-02-18 14:20:00'),

-- 审批操作日志
(16, 'approve_application', '批准申请：学生张三的Java后端开发实习生申请', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-20 14:20:00'),
(16, 'approve_application', '批准申请：学生李四的前端开发实习生申请', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-21 10:30:00'),
(17, 'approve_application', '批准申请：学生王五的微信小程序开发实习生申请', '192.168.1.201', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-02-23 16:00:00'),
(16, 'reject_application', '拒绝申请：学生黄三的Java后端开发实习生申请', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-03-02 10:00:00'),

-- 岗位操作日志
(24, 'create_position', '发布岗位：Java后端开发实习生', '192.168.1.300', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-10 10:00:00'),
(24, 'create_position', '发布岗位：前端开发实习生（React方向）', '192.168.1.300', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-10 10:30:00'),
(25, 'create_position', '发布岗位：微信小程序开发实习生', '192.168.1.301', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-02-12 14:00:00'),
(24, 'update_position', '更新岗位：Java后端开发实习生', '192.168.1.300', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-25 15:00:00'),

-- 实习日志操作
(1, 'create_log', '提交实习日志：2024-03-01', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-03-01 18:00:00'),
(1, 'create_log', '提交实习日志：2024-03-04', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-03-04 19:00:00'),
(2, 'create_log', '提交实习日志：2024-03-15', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-03-15 20:00:00'),

-- 文件上传操作
(1, 'upload_file', '上传文件：实习周报_第1周.docx', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-03-08 16:00:00'),
(1, 'upload_file', '上传文件：实习周报_第2周.docx', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-03-15 16:30:00'),
(2, 'upload_file', '上传文件：前端开发规范学习笔记.md', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-03-20 17:00:00'),

-- 评价操作
(16, 'submit_evaluation', '提交教师评价：学生张三', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-07-02 10:00:00'),
(24, 'submit_evaluation', '提交企业评价：学生张三', '192.168.1.300', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-07-03 14:00:00'),
(16, 'submit_evaluation', '提交教师评价：学生李四', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-07-18 11:00:00'),
(24, 'submit_evaluation', '提交企业评价：学生李四', '192.168.1.300', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-07-19 15:00:00'),

-- 通知操作
(1, 'read_notification', '阅读通知：申请已批准', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-20 15:00:00'),
(2, 'read_notification', '阅读通知：申请已批准', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', '2024-02-21 11:00:00'),
(16, 'read_notification', '阅读通知：新的申请待审核', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-02-15 11:00:00');

-- ============================================
-- 数据插入完成
-- ============================================

-- 查看插入的数据统计
SELECT 
  '用户' AS 表名, COUNT(*) AS 记录数 FROM users
UNION ALL
SELECT '学生', COUNT(*) FROM students
UNION ALL
SELECT '教师', COUNT(*) FROM teachers
UNION ALL
SELECT '企业', COUNT(*) FROM enterprises
UNION ALL
SELECT '岗位', COUNT(*) FROM positions
UNION ALL
SELECT '申请', COUNT(*) FROM applications
UNION ALL
SELECT '实习记录', COUNT(*) FROM internships
UNION ALL
SELECT '实习日志', COUNT(*) FROM internship_logs
UNION ALL
SELECT '实习文件', COUNT(*) FROM internship_files
UNION ALL
SELECT '通知', COUNT(*) FROM notifications
UNION ALL
SELECT '操作日志', COUNT(*) FROM operation_logs;

-- 显示成功消息
SELECT '测试数据插入成功！' AS 状态,
       '包含15个学生、8个教师、10个企业、20个岗位、12个申请、6个实习记录等完整测试数据' AS 说明;
