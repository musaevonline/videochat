const path = require("path");

console.log(`${process.env.NODE_ENV} building`)
module.exports = {
  mode: process.env.NODE_ENV || "development",
  output: {
    publicPath: process.env.APP_ENV === 'server' ? '/videochat' : '/',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: "url-loader",
      },
    ],
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, "src/assets"),
    },
  },
};
