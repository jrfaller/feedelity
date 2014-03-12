var request = require('request'),
  FeedParser = require('feedparser'),
  async = require('async')
  mongoose = require('mongoose'),
  Q = require('q'),
	conf = require('../config.json');

exports.hasRights = function(req, res) {
	return req.password == conf.password;
}

mongoose.connect('mongodb://localhost/feedelity');

var db = mongoose.connection;

var feedSchema = mongoose.Schema({
  name: String,
  url: String,
  tags: [String],
  lastChecked: Date,
  lastFetched: Number,  
  state: String
});

var articleSchema = mongoose.Schema({
  _feed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feed' }],
  guid: String,
  title: String,
  date: Date,
  summary: String,
  description: String,
  link: String,
  author: String,
  read: Boolean,
  starred: Boolean
});
	
Feed = mongoose.model('Feed', feedSchema);
Article = mongoose.model('Article', articleSchema);

exports.getUnreadArticles = function (req, res) {
  Article.find({read: false}).populate('_feed', 'name tags').exec().then(function(articles) {
    articles.sort(compareArticles);
    res.json(articles);
  });
}

exports.getReadArticles = function (req, res) {
  Article.find({read: true}).populate('_feed', 'name tags').exec().then(function(articles) {
    articles.sort(compareArticles);
    res.json(articles);
  });
}

exports.getStarredArticles = function (req, res) {
  Article.find({starred: true}).populate('_feed', 'name tags').exec().then(function(articles) {
    articles.sort(compareArticles);
    res.json(articles); 
  });
}

exports.refreshArticles = function (req, res) {
  Feed.find().exec().then(function(feeds) {
    async.map(feeds, refreshArticles, function(err, results) {
      res.json(results); 
    });
  });
}

exports.updateArticle = function(req, res) {
  var query = { _id: req.body._id };
  var update = {
    starred: req.body.starred,
    read: req.body.read,
  }
  Article.findOneAndUpdate(query, update).exec().then(function(article) { res.status(200).send(article); });
}

exports.getFeed = function(req,res) {
  var id = req.params.id;
  var feed = Feed.findById(id).exec();
  feed.then( function(feed) { res.json(feed); });
}

exports.getFeeds = function(req, res) {
  Feed.find().exec().then(function(feeds) { res.json(feeds); });
}

exports.delFeed = function(req, res) {
  var id = req.params.id;
  Article.remove({_feed: id}).exec().then( function(articles) {
    Feed.remove({ _id: id}).exec().then(function(feed) { res.status(200).send(); });
  });
}

exports.addFeed = function(req, res) {
  addFeed = new Feed({
    name: req.body.name,
    url: req.body.url,
    tags: req.body.tags,
    state: 'New',
    lastFetched: 0
  });
  Feed.create(addFeed).then(function(addFeed) { res.status(200).send(addFeed); });
}

exports.updateFeed = function(req, res) {
  var query = { _id: req.body._id };
  var update = {
    name: req.body.name,
    url: req.body.url,
    tags: req.body.tags
  }
  Feed.findOneAndUpdate(query, update).exec().then(function(feed) { res.status(200).send(feed); });
}

function refreshArticles(feed, callBack) {
	var articles = [];
	var feedMeta;
	
	var req = request(feed.url);
	var feedParser = new FeedParser();
	req.on('error', function (error) { callBack(error); });
	req.on('response', function (res) {
		var stream = this;
		if (res.statusCode != 200) callback(new Error('Bad status code'));
		stream.pipe(feedParser);
	});
	feedParser.on('error', function(error) { callBack(error); });
  feedParser.on('meta' , function(meta) { feedMeta = this.meta; });
	feedParser.on('readable', function() {
		var stream = this;
		var item
		while (item = stream.read()) {
			var candidate = extractArticle(item, feed);
			if (checkArticle(candidate)) articles.push(candidate);
		}
	});
	feedParser.on('end', function() {
      var guids = articles.map(function(article) { return article.guid; });
      Article.find({_feed: feed._id}).where('guid').in(guids).exec().then(function(articles) { 
        var existing = articles.map(function(article) { return article.guid; });
        var added = [];
        for (var i = 0; i < fArticles.length; i++) {
          var cur = fArticles[i];
          if (existing.indexOf(cur.guid) == -1) added.push(cur);
        }
        Article.create(added, function(err) {
          Feed.findOneAndUpdate({_id: feed._id}, {lastChecked: new Date(), lastFetched: added.length, state: 'OK'} ).exec().then(
            function(feed) { callBack(null, {_feed: feed._id, numAdded: added.length}); }
          );
        });
      });
    });
}

function checkArticle(article) {
	if (article.date == null) return false;
	else if (monthsDiff(article.date, new Date()) > conf.activePeriod) return false;
	else if (article.title == undefined) return false;
	else if (article.url == undefined) return false;
	else return true;
}

function compareArticles(a1, a2) {
    return new Date(a2.date).getTime() - new Date(a1.date).getTime();
}

function extractArticle(item, feed) {
  return new Article({
    title: item.title,
    summary: item.summary,
    description: item.description,
    author: item.author,
    date: Date.parse(item.date),
    link: item.link,
    guid: item.guid,
    _feed: feed._id,
    read: false,
    starred: false
  });
}
	
function monthsDiff(d1, d2) {
	return d2.getMonth() -  d1.getMonth() + (12 * (d2.getFullYear() - d1.getFullYear()));	
}