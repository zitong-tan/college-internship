/**
 * 测试登录API
 */
const http = require('http');

const testLogin = () => {
  const postData = JSON.stringify({
    username: 'student1',
    password: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('发送登录请求...');
  console.log('请求数据:', postData);

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n响应状态码:', res.statusCode);
      console.log('响应数据:');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('请求错误:', e.message);
    console.log('\n请确保后端服务器正在运行: npm start');
  });

  req.setTimeout(5000, () => {
    console.error('请求超时！');
    req.destroy();
  });

  req.write(postData);
  req.end();
};

testLogin();
