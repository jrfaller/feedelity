/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  path = require('path');

var app = module.exports = express();

/**
* Configuration
*/

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
   app.use(express.errorHandler());
};

// production only
if (app.get('env') === 'production') {
  // TODO
}; 

// Routes
app.get('/', routes.index);
app.get('/partial/:name', routes.partial);

// JSON API
app.get('/api/refresh', api.refreshFeeds);
app.get('/api/articles/unread', api.getUnreadArticles);
app.get('/api/articles/read', api.getReadArticles);
app.get('/api/articles/starred', api.getStarredArticles);
app.post('/api/articles/:id', api.updateArticle);
app.get('/api/feeds', api.getFeeds);
app.post('/api/feeds', api.addFeed);
app.post('/api/feeds/:id', api.updateFeed);
app.delete('/api/feeds/:id', api.delFeed);
app.get('/api/feeds/:id', api.getFeed);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/**
* Start Server
*/

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
