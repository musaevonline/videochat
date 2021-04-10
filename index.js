const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const https = require("https");
const fs = require("fs");
var Turn = require("node-turn");

function getCookie(cookies, name) {
  let matches = cookies.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

app.use(bodyParser.json());
app.use(express.static("frontend/dist"));

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <script>window.ENV="${process.env.APP_ENV || 'undefined'}"</script>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script defer src="/${process.env.APP_ENV === 'server' ? 'videochat/' : ''}main.js"></script>
  </head>
  <body style="margin: 0">
    <div id="app" style="overflow: hidden;"></div>
  </body>
</html>
  `);
});

const server = https
  .createServer(
    {
      key: fs.readFileSync("./certs/key.pem"),
      cert: fs.readFileSync("./certs/cert.pem"),
      passphrase: "phpisbad",
    },
    app
  )
  .listen(2100, "0.0.0.0", () => {
    console.log(`Example app listening at https://0.0.0.0:2100`);
  });

const free = [];
const wss = new WebSocket.Server({ server });

const try_connect = (ws) => {
  console.log(ws.token);
  if (
    free.filter((c) => c.token != ws.token).length &&
    (!ws.previous || free[0].token != ws.previous.token)
  ) {
    ws.par = free.shift();
    if (ws.par) ws.par.par = ws;
    ws.send(JSON.stringify({ ready: true }));
    //free = free.filter(c => c.token != ws.token)
    console.log("go");
  } else {
    if (!free.find((c) => c.token == ws.token)) free.push(ws);
  }
  console.log(free.length);
};

wss.on("connection", function (ws, request) {
  ws.token = getCookie(request.headers.cookie, "token");
  try_connect(ws);
  ws.on("message", function (data) {
    const r = JSON.parse(data);
    console.log(Object.keys(r)[0]);
    if (r.new) {
      if (ws.par) {
        ws.par.par = undefined;
        ws.previous = ws.par;
        if (ws.par) {
          ws.par.previous = ws;
          ws.par.send(JSON.stringify({ reconnect: true }));
        }
        console.log("reconnect");
      }
      ws.par = undefined;
      try_connect(ws);
      return;
    }
    if (ws.par) {
      ws.par.send(data);
    }
  });
});

new Turn({
  authMech: "long-term",
  credentials: {
    username: "password",
    password: "password",
  },
}).start();
