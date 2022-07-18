const turn = require("node-turn");

new turn({
    authMech: "long-term",
    credentials: {
      username: "password",
      password: "password",
    },
  }).start();
  