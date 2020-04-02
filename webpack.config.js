const path = require('path');

module.exports = {
  entry: './src/a3.js',
  devtool: "source-map",
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
};