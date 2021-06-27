const page = `
<html>
<head>
  <script>window.ENV="${process.env.APP_ENV || "undefined"}"</script>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script defer src="/${
    process.env.APP_ENV === "server" ? "videochat/" : ""
  }main.js"></script>
</head>
<body style="margin: 0">
  <div id="app" style="overflow: hidden;"></div>
</body>
</html>
`;

module.exports = {
  page,
};
