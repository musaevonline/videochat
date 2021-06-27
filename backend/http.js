const fs = require("fs");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const { page } = require("./constants");

const app = express();
app.use(bodyParser.json());
app.use(express.static("frontend/dist"));
app.get("/", (req, res) => {
  res.send(page);
});

const server = https
  .createServer(
    {
      key: fs.readFileSync("certs/key.pem"),
      cert: fs.readFileSync("certs/cert.pem"),
      passphrase: "phpisbad",
    },
    app
  )
  .listen(2100, "0.0.0.0", () => {
    console.log(`Example app listening at https://0.0.0.0:2100`);
  });

module.exports = {
  server,
};
