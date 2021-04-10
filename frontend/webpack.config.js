const path = require("path");

const ENVIRONMENTS = {
  'dev': 'development',
  'prod': 'production',
  'server': 'production'
}

module.exports = {
  mode: ENVIRONMENTS[process.env.NODE_ENV] || "development",
  publicPath: process.env.NODE_ENV === 'server' ? '/videochat' : '/',
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
