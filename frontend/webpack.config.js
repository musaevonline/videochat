const path = require("path");

module.exports = {
  mode: "development",
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
