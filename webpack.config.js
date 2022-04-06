const path = require("path");

module.exports = {
  entry: "./src/jsontable-demo-client.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "demo-server-client-bundle.js",
    path: path.resolve(__dirname, "demo-server"),
  },
  mode: "none",
};