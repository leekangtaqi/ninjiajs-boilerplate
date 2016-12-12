/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import express from 'express';
import config from './config/environment';
import compression from 'compression';
import { createServer } from 'http';

// Setup server
var app = express();
app.set('env', process.env.NODE_ENV);
var server = createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('91拼团微信客户端以 %s 模式, 监听 %d 端口', config.env, config.port);
});

// start a webpack-dev-server with config
if(process.env.NODE_ENV === 'development'){
  let webpack = require('webpack');
  let WebpackDevServer = require('webpack-dev-server');
  let webpackConfig = require('../webpack.config.js');
  let port = webpackConfig.devServer.port;
  let host = webpackConfig.devServer.host;

  new WebpackDevServer(webpack(webpackConfig), {
    publicPath: webpackConfig.output.publicPath,
    hot: webpackConfig.devServer.hot,
    historyApiFallback: true,
    proxy: {
      "/*": `http://localhost:${config.port}`,
      "/api/*": `http://localhost:${config.port}`,
      "/config/*": `http://localhost:${config.port}`
    },
    quiet: true,
    noInfo: webpackConfig.devServer.noInfo,
    stats: webpackConfig.devServer.stats
  }).listen(port, host, function (err, result) {
    if (err) {
      console.log(err);
    }
    console.log(`[system] Webpack Dev Server is startup, Listening at ${host}:${port}`);
  });  
}

// Expose app
exports = module.exports = app;
