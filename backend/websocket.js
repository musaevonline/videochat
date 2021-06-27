const { Server } = require("ws");
const { server } = require("./http");
const { getCookie, json } = require("./utils");

const free = [];
const wss = new Server({ server });

const connect = (ws) => {
  if (free.filter((c) => c.token != ws.token).length) {
    ws.friend = free.shift();
    ws.friend.friend = ws;
    ws.send(json({ ready: true }));
  } else {
    if (!free.find((c) => c.token == ws.token)) free.push(ws);
  }
  console.log(free.length);
};

function reconnect(ws) {
  if (ws.friend) {
    ws.friend.friend = undefined;
    ws.friend.send(json({ reconnect: true }));
    ws.friend = undefined;
  }
  connect(ws);
}

function handleMessage(ws, data) {
  try {
    const message = JSON.parse(data);
    if (message.new) {
      reconnect(ws);
    } else {
      ws.friend.send(data);
    }
  } catch (e) {
    console.log(e);
  }
}

wss.on("connection", function (ws, request) {
  try {
    ws.token = getCookie(request.headers.cookie, "token");
    ws.on("message", (data) => handleMessage(ws, data));
    connect(ws);
  } catch (error) {
    console.error(error);
  }
});
