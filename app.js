const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      CronJob      = require('cron').CronJob,
      express      = require('express'),
      env          = process.env;


new CronJob('* * 00 00 * *', function(){
  let file = fs.createWriteStream("./static/data/data.txt");
  let request = http.get("http://inflacionverdadera.com/pricestats_index_ARGENTINA_state.txt", function(response) {
    response.pipe(file);
  });
}, null, true);

let app = express();

app.use(express.static('static'));

app.get('/', function (req, res) {
});

app.get("/health",function(req, res) {
  res.sendStatus(200);
});

let server = app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {});

/*
let server = http.createServer(function (req, res) {
  let url = req.url;
  if (url == '/') {
    url += 'index.html';
  }

  // IMPORTANT: Your application HAS to respond to GET /health with status 200
  //            for OpenShift health monitoring

  if (url == '/health') {
    res.writeHead(200);
    res.end();
  } else if (url == '/info/gen' || url == '/info/poll') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo[url.slice(6)]()));
  } else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        let ext = path.extname(url).slice(1);
        res.setHeader('Content-Type', contentTypes[ext]);
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        }
        res.end(data);
      }
    });
  }
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});
*/