# 部署指南

## 概述

本文档详细说明如何将高校实习管理系统部署到生产环境。系统采用前后端分离架构，需要分别部署前端和后端服务。

---

## 目录

1. [系统要求](#系统要求)
2. [环境准备](#环境准备)
3. [数据库初始化](#数据库初始化)
4. [后端部署](#后端部署)
5. [前端部署](#前端部署)
6. [Nginx 配置](#nginx-配置)
7. [SSL 证书配置](#ssl-证书配置)
8. [进程管理](#进程管理)
9. [监控和日志](#监控和日志)
10. [备份策略](#备份策略)
11. [故障排查](#故障排查)

---

## 系统要求

### 硬件要求

**最低配置**:
- CPU: 2 核
- 内存: 4GB
- 硬盘: 20GB SSD

**推荐配置**:
- CPU: 4 核
- 内存: 8GB
- 硬盘: 50GB SSD

### 软件要求

- **操作系统**: Ubuntu 20.04 LTS 或更高版本 / CentOS 7+ / Windows Server 2019+
- **Node.js**: v16.x 或更高版本
- **MySQL**: v8.0 或更高版本
- **Nginx**: v1.18 或更高版本（可选，用于反向代理）
- **PM2**: v5.x（用于进程管理）

---

## 环境准备

### 1. 安装 Node.js

**Ubuntu/Debian**:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL**:
```bash
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs
```

**验证安装**:
```bash
node --version  # 应显示 v16.x.x
npm --version   # 应显示 8.x.x
```


### 2. 安装 MySQL

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**CentOS/RHEL**:
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation
```

**验证安装**:
```bash
mysql --version  # 应显示 8.0.x
```

### 3. 安装 Nginx（可选）

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**CentOS/RHEL**:
```bash
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. 安装 PM2

```bash
sudo npm install -g pm2
pm2 --version  # 验证安装
```

### 5. 创建部署用户

```bash
# 创建专用部署用户
sudo useradd -m -s /bin/bash deploy
sudo passwd deploy

# 添加到 sudo 组（如需要）
sudo usermod -aG sudo deploy

# 切换到部署用户
su - deploy
```

---

## 数据库初始化

### 1. 创建数据库

登录 MySQL:
```bash
mysql -u root -p
```

执行以下 SQL 命令:
```sql
-- 创建数据库
CREATE DATABASE internship_management 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 创建数据库用户
CREATE USER 'internship_user'@'localhost' 
  IDENTIFIED BY 'your_strong_password_here';

-- 授予权限
GRANT ALL PRIVILEGES ON internship_management.* 
  TO 'internship_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```


### 2. 配置 MySQL

编辑 MySQL 配置文件:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加或修改以下配置:
```ini
[mysqld]
# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 性能优化
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

重启 MySQL:
```bash
sudo systemctl restart mysql
```

### 3. 验证数据库连接

```bash
mysql -u internship_user -p internship_management
```

---

## 后端部署

### 1. 上传代码

**方式 A: 使用 Git**:
```bash
cd /home/deploy
git clone <repository-url> internship-system
cd internship-system/backend
```

**方式 B: 使用 SCP**:
```bash
# 在本地机器上执行
scp -r ./backend deploy@your-server:/home/deploy/internship-system/
```

### 2. 安装依赖

```bash
cd /home/deploy/internship-system/backend
npm install --production
```

### 3. 配置环境变量

创建生产环境配置文件:
```bash
cp .env.example .env
nano .env
```

编辑 `.env` 文件:
```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=internship_management
DB_USER=internship_user
DB_PASSWORD=your_strong_password_here

# JWT 配置（必须使用强随机字符串）
JWT_SECRET=your_production_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=24h

# 会话配置
SESSION_TIMEOUT=86400000

# 文件上传配置
UPLOAD_DIR=/home/deploy/internship-system/backend/uploads
MAX_FILE_SIZE=10485760

# 日志配置
LOG_LEVEL=info
LOG_DIR=/home/deploy/internship-system/backend/logs
```

**重要**: 
- 将 `DB_PASSWORD` 替换为实际的数据库密码
- 将 `JWT_SECRET` 替换为强随机字符串（至少 32 字符）
- 可以使用以下命令生成随机密钥:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```


### 4. 运行数据库迁移

```bash
cd /home/deploy/internship-system/backend
npm run migrate
```

预期输出:
```
Running migrations...
✓ Migration 001-create-users-table.js completed
✓ Migration 002-create-students-table.js completed
✓ Migration 003-create-teachers-table.js completed
...
✓ All migrations completed successfully
```

### 5. 创建必要的目录

```bash
mkdir -p /home/deploy/internship-system/backend/uploads
mkdir -p /home/deploy/internship-system/backend/logs
chmod 755 /home/deploy/internship-system/backend/uploads
chmod 755 /home/deploy/internship-system/backend/logs
```

### 6. 测试后端服务

```bash
npm start
```

访问 `http://your-server:3000/health` 验证服务是否正常运行。

按 `Ctrl+C` 停止测试服务。

### 7. 使用 PM2 启动后端服务

创建 PM2 配置文件:
```bash
nano ecosystem.config.js
```

添加以下内容:
```javascript
module.exports = {
  apps: [{
    name: 'internship-backend',
    script: './src/server.js',
    cwd: '/home/deploy/internship-system/backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

启动服务:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

验证服务状态:
```bash
pm2 status
pm2 logs internship-backend
```

---

## 前端部署

### 1. 构建前端应用

**在本地机器上**:
```bash
cd /path/to/project
npm install
npm run build
```

这将在 `dist/` 目录生成生产版本的静态文件。


### 2. 上传前端文件

**方式 A: 使用 SCP**:
```bash
# 在本地机器上执行
scp -r ./dist/* deploy@your-server:/var/www/internship-system/
```

**方式 B: 使用 rsync**:
```bash
rsync -avz --delete ./dist/ deploy@your-server:/var/www/internship-system/
```

### 3. 设置文件权限

```bash
sudo chown -R www-data:www-data /var/www/internship-system
sudo chmod -R 755 /var/www/internship-system
```

---

## Nginx 配置

### 1. 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/internship-system
```

添加以下配置:
```nginx
# 后端 API 服务器
upstream backend_api {
    server 127.0.0.1:3000;
    # 如果使用多个实例，可以添加更多服务器
    # server 127.0.0.1:3001;
    keepalive 64;
}

# HTTP 服务器（重定向到 HTTPS）
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书配置（稍后配置）
    # ssl_certificate /etc/ssl/certs/your-domain.crt;
    # ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 前端静态文件
    root /var/www/internship-system;
    index index.html;
    
    # 日志配置
    access_log /var/log/nginx/internship-access.log;
    error_log /var/log/nginx/internship-error.log;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # API 代理
    location /api {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查端点
    location /health {
        proxy_pass http://backend_api;
        access_log off;
    }
    
    # 前端路由（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```


### 2. 启用站点配置

```bash
sudo ln -s /etc/nginx/sites-available/internship-system /etc/nginx/sites-enabled/
```

### 3. 测试 Nginx 配置

```bash
sudo nginx -t
```

预期输出:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4. 重启 Nginx

```bash
sudo systemctl restart nginx
```

---

## SSL 证书配置

### 方式 A: 使用 Let's Encrypt（推荐）

**1. 安装 Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

**2. 获取证书**:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**3. 自动续期**:
```bash
sudo certbot renew --dry-run
```

Certbot 会自动设置 cron 任务进行证书续期。

### 方式 B: 使用自签名证书（仅用于测试）

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt
```

然后在 Nginx 配置中使用:
```nginx
ssl_certificate /etc/ssl/certs/selfsigned.crt;
ssl_certificate_key /etc/ssl/private/selfsigned.key;
```

---

## 进程管理

### PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看进程详情
pm2 show internship-backend

# 查看日志
pm2 logs internship-backend

# 重启服务
pm2 restart internship-backend

# 停止服务
pm2 stop internship-backend

# 删除进程
pm2 delete internship-backend

# 监控
pm2 monit

# 保存当前进程列表
pm2 save

# 设置开机自启
pm2 startup
```

### 更新应用

```bash
# 1. 拉取最新代码
cd /home/deploy/internship-system/backend
git pull origin main

# 2. 安装新依赖
npm install --production

# 3. 运行迁移（如有）
npm run migrate

# 4. 重启服务
pm2 restart internship-backend

# 5. 更新前端（如需要）
# 在本地构建后上传
scp -r ./dist/* deploy@your-server:/var/www/internship-system/
```


---

## 监控和日志

### 1. 应用日志

**后端日志位置**:
- PM2 日志: `/home/deploy/internship-system/backend/logs/pm2-*.log`
- 应用日志: `/home/deploy/internship-system/backend/logs/app-*.log`

**查看日志**:
```bash
# 实时查看 PM2 日志
pm2 logs internship-backend

# 查看应用日志
tail -f /home/deploy/internship-system/backend/logs/app-error.log
```

### 2. Nginx 日志

**日志位置**:
- 访问日志: `/var/log/nginx/internship-access.log`
- 错误日志: `/var/log/nginx/internship-error.log`

**查看日志**:
```bash
tail -f /var/log/nginx/internship-access.log
tail -f /var/log/nginx/internship-error.log
```

### 3. MySQL 日志

**日志位置**:
- 错误日志: `/var/log/mysql/error.log`
- 慢查询日志: `/var/log/mysql/slow-query.log`

**查看日志**:
```bash
sudo tail -f /var/log/mysql/error.log
sudo tail -f /var/log/mysql/slow-query.log
```

### 4. 日志轮转

创建日志轮转配置:
```bash
sudo nano /etc/logrotate.d/internship-system
```

添加以下内容:
```
/home/deploy/internship-system/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/internship-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
```

### 5. 系统监控

**安装监控工具**:
```bash
# 安装 htop
sudo apt install htop

# 安装 netdata（可选）
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

**监控命令**:
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
netstat -tulpn | grep LISTEN
```


---

## 备份策略

### 1. 数据库备份

**创建备份脚本**:
```bash
nano /home/deploy/scripts/backup-database.sh
```

添加以下内容:
```bash
#!/bin/bash

# 配置
DB_NAME="internship_management"
DB_USER="internship_user"
DB_PASS="your_password"
BACKUP_DIR="/home/deploy/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_FILE

# 删除 30 天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_FILE"
```

**设置权限**:
```bash
chmod +x /home/deploy/scripts/backup-database.sh
```

**设置定时任务**:
```bash
crontab -e
```

添加以下行（每天凌晨 2 点备份）:
```
0 2 * * * /home/deploy/scripts/backup-database.sh >> /home/deploy/logs/backup.log 2>&1
```

### 2. 文件备份

**备份上传的文件**:
```bash
#!/bin/bash

UPLOAD_DIR="/home/deploy/internship-system/backend/uploads"
BACKUP_DIR="/home/deploy/backups/uploads"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $UPLOAD_DIR .

# 删除 30 天前的备份
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
```

### 3. 恢复数据库

```bash
# 解压备份文件
gunzip backup_20240115_020000.sql.gz

# 恢复数据库
mysql -u internship_user -p internship_management < backup_20240115_020000.sql
```

---

## 故障排查

### 问题 1: 后端服务无法启动

**检查步骤**:
```bash
# 1. 查看 PM2 日志
pm2 logs internship-backend --lines 100

# 2. 检查端口占用
sudo netstat -tulpn | grep 3000

# 3. 检查环境变量
cat /home/deploy/internship-system/backend/.env

# 4. 测试数据库连接
mysql -u internship_user -p internship_management
```

**常见原因**:
- 端口被占用
- 数据库连接失败
- 环境变量配置错误
- 依赖未安装


### 问题 2: Nginx 502 Bad Gateway

**检查步骤**:
```bash
# 1. 检查后端服务是否运行
pm2 status

# 2. 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/internship-error.log

# 3. 测试后端服务
curl http://localhost:3000/health

# 4. 检查 Nginx 配置
sudo nginx -t
```

**常见原因**:
- 后端服务未运行
- 端口配置错误
- 防火墙阻止连接

### 问题 3: 数据库连接失败

**检查步骤**:
```bash
# 1. 检查 MySQL 服务状态
sudo systemctl status mysql

# 2. 测试数据库连接
mysql -u internship_user -p internship_management

# 3. 检查数据库用户权限
mysql -u root -p
SHOW GRANTS FOR 'internship_user'@'localhost';

# 4. 检查环境变量
grep DB_ /home/deploy/internship-system/backend/.env
```

### 问题 4: 前端页面无法访问

**检查步骤**:
```bash
# 1. 检查 Nginx 状态
sudo systemctl status nginx

# 2. 检查文件权限
ls -la /var/www/internship-system/

# 3. 检查 Nginx 配置
sudo nginx -t

# 4. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/internship-error.log
```

### 问题 5: SSL 证书问题

**检查步骤**:
```bash
# 1. 检查证书文件
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# 2. 测试证书
sudo certbot certificates

# 3. 手动续期
sudo certbot renew

# 4. 检查 Nginx SSL 配置
sudo nginx -t
```

---

## 性能优化

### 1. Node.js 优化

**增加内存限制**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'internship-backend',
    script: './src/server.js',
    node_args: '--max-old-space-size=2048',
    // ...其他配置
  }]
};
```

### 2. MySQL 优化

**优化查询**:
```sql
-- 添加索引
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_positions_status ON positions(status);

-- 分析慢查询
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;
```


### 3. Nginx 优化

**调整 worker 进程**:
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 2048;

# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

server {
    # ...
    location /api {
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        # ...
    }
}
```

### 4. 启用 HTTP/2

确保 Nginx 配置中启用了 HTTP/2:
```nginx
listen 443 ssl http2;
```

---

## 安全加固

### 1. 防火墙配置

**使用 UFW (Ubuntu)**:
```bash
# 启用防火墙
sudo ufw enable

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看状态
sudo ufw status
```

### 2. 限制 SSH 访问

编辑 SSH 配置:
```bash
sudo nano /etc/ssh/sshd_config
```

修改以下设置:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

重启 SSH:
```bash
sudo systemctl restart sshd
```

### 3. 设置 fail2ban

```bash
# 安装 fail2ban
sudo apt install fail2ban

# 创建配置
sudo nano /etc/fail2ban/jail.local
```

添加以下内容:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
```

启动服务:
```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 4. 定期更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# 设置自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 部署检查清单

部署完成后，使用以下清单验证系统:

- [ ] Node.js 已安装并版本正确
- [ ] MySQL 已安装并运行
- [ ] 数据库已创建并配置用户权限
- [ ] 数据库迁移已成功运行
- [ ] 后端环境变量已正确配置
- [ ] 后端服务通过 PM2 运行
- [ ] 前端文件已上传到正确位置
- [ ] Nginx 已配置并运行
- [ ] SSL 证书已配置（生产环境）
- [ ] 防火墙已配置
- [ ] 日志轮转已配置
- [ ] 数据库备份已配置
- [ ] 监控工具已安装
- [ ] 所有服务设置为开机自启
- [ ] 测试所有主要功能


---

## 快速部署脚本

以下是一个自动化部署脚本示例:

```bash
#!/bin/bash

# 高校实习管理系统 - 快速部署脚本
# 使用方法: sudo bash deploy.sh

set -e

echo "=== 高校实习管理系统部署脚本 ==="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
  echo "请使用 sudo 运行此脚本"
  exit 1
fi

# 配置变量
DEPLOY_USER="deploy"
APP_DIR="/home/$DEPLOY_USER/internship-system"
WEB_DIR="/var/www/internship-system"
DB_NAME="internship_management"
DB_USER="internship_user"

# 1. 安装依赖
echo "1. 安装系统依赖..."
apt update
apt install -y nodejs npm mysql-server nginx git

# 2. 安装 PM2
echo "2. 安装 PM2..."
npm install -g pm2

# 3. 创建部署用户
echo "3. 创建部署用户..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    echo "用户 $DEPLOY_USER 已创建"
fi

# 4. 创建目录
echo "4. 创建应用目录..."
mkdir -p $APP_DIR
mkdir -p $WEB_DIR
mkdir -p $APP_DIR/backend/logs
mkdir -p $APP_DIR/backend/uploads

# 5. 设置权限
echo "5. 设置文件权限..."
chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
chown -R www-data:www-data $WEB_DIR

# 6. 配置数据库
echo "6. 配置数据库..."
read -sp "请输入 MySQL root 密码: " MYSQL_ROOT_PASS
echo ""
read -sp "请输入新数据库用户密码: " DB_PASS
echo ""

mysql -u root -p$MYSQL_ROOT_PASS <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "数据库配置完成"

# 7. 配置防火墙
echo "7. 配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=== 部署脚本执行完成 ==="
echo ""
echo "下一步:"
echo "1. 上传应用代码到 $APP_DIR"
echo "2. 配置 .env 文件"
echo "3. 运行数据库迁移"
echo "4. 使用 PM2 启动后端服务"
echo "5. 配置 Nginx"
echo ""
echo "详细步骤请参考部署文档"
```

---

## 附录

### A. 环境变量完整示例

```env
# 服务器配置
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=internship_management
DB_USER=internship_user
DB_PASSWORD=your_strong_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT 配置
JWT_SECRET=your_production_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 会话配置
SESSION_TIMEOUT=86400000

# 文件上传配置
UPLOAD_DIR=/home/deploy/internship-system/backend/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# 日志配置
LOG_LEVEL=info
LOG_DIR=/home/deploy/internship-system/backend/logs
LOG_MAX_SIZE=10m
LOG_MAX_FILES=14d

# CORS 配置
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true

# 邮件配置（如需要）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your_smtp_password
SMTP_FROM=高校实习管理系统 <noreply@your-domain.com>
```


### B. PM2 Ecosystem 完整配置

```javascript
module.exports = {
  apps: [
    {
      name: 'internship-backend',
      script: './src/server.js',
      cwd: '/home/deploy/internship-system/backend',
      
      // 实例配置
      instances: 'max',  // 或指定数字，如 2
      exec_mode: 'cluster',
      
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // 监控配置
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Node.js 参数
      node_args: '--max-old-space-size=2048',
      
      // 其他配置
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true
    }
  ],
  
  // 部署配置（可选）
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo.git',
      path: '/home/deploy/internship-system',
      'post-deploy': 'cd backend && npm install --production && npm run migrate && pm2 reload ecosystem.config.js'
    }
  }
};
```

### C. Nginx 完整配置（带缓存）

```nginx
# 缓存配置
proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;

# 限流配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

upstream backend_api {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 根目录
    root /var/www/internship-system;
    index index.html;
    
    # 日志
    access_log /var/log/nginx/internship-access.log combined;
    error_log /var/log/nginx/internship-error.log warn;
    
    # 客户端配置
    client_max_body_size 10M;
    client_body_timeout 60s;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    
    # 登录接口限流
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        proxy_pass http://backend_api;
        include /etc/nginx/proxy_params.conf;
    }
    
    # API 代理
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
        # 缓存配置（仅 GET 请求）
        proxy_cache api_cache;
        proxy_cache_methods GET;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://backend_api;
        include /etc/nginx/proxy_params.conf;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://backend_api;
        access_log off;
    }
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### D. 常用命令速查

```bash
# 系统服务
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl status mysql
sudo systemctl restart mysql

# PM2
pm2 list
pm2 logs internship-backend
pm2 restart internship-backend
pm2 monit

# 日志查看
tail -f /var/log/nginx/internship-error.log
tail -f /home/deploy/internship-system/backend/logs/app-error.log
pm2 logs internship-backend --lines 100

# 数据库
mysql -u internship_user -p internship_management
mysqldump -u internship_user -p internship_management > backup.sql

# 磁盘和内存
df -h
free -h
du -sh /home/deploy/internship-system/*

# 网络
netstat -tulpn | grep LISTEN
ss -tulpn | grep :3000
```

---

**部署文档结束**

如有问题，请参考故障排查章节或联系技术支持。

