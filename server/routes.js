/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
// import serverSideRendering from './middlewares/server-side-rendering';

module.exports = function(app) {

  // app.use(serverSideRendering);
  // Insert routes below
  app.use('/config', require('./api/config'));
  app.use('/api', require('./api/api'));

  app.route('/MP_verify_:mpId.txt').get(function(req, res){
    res.send(req.params.mpId);
  })
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);
  
  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(__dirname, '../', app.get('appPath') + '/index.html'));
    });
};
