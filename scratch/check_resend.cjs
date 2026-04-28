const https = require('https');

const options = {
  hostname: 'api.resend.com',
  port: 443,
  path: '/domains',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer re_Kuk4hfNd_AxbKgULwozDsg3BZopvnS75J',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
