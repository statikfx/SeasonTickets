// system reqs.
var PATH = require("path");
var SYS = require("sys");
// user reqs.
var express = require("express");
var coffeekup = require("coffeekup");
var db = require("./db/db")("", "cubs");


// hold global configuration options
var CONFIG = {
  WEBROOT: PATH.dirname(__filename),
  PORT: process.env.PORT || 9999,
  SITE: {
    title: "Season Tickets"
  }
};

// create server
var app = express.createServer();

// configure express options -- order matters
app.configure(function() {
  // view rendering config
  app.set("views", PATH.join(CONFIG.WEBROOT, "views"));
  app.register(".coffee", coffeekup);
  app.set("view engine", "coffeekup");
  app.set("view options", {
    layout: true
  });
  
  app.use(express.logger({
    format: ":method :url"
  }));
  app.use(app.router);
  // serve static files out of /public
  app.use(express.static(PATH.join(CONFIG.WEBROOT, "public")));
});

// homepage
app.get("/", function(req, res) {
  db.view("games", "pending", function(err, docs) {
    res.render("index", {context: {site: CONFIG.SITE, games: docs.rows, path: '/'}}); 
  });
});

// game
app.get("/g/:gameId/?", function(req, res) {
  db.get(req.params.gameId, function(err, doc) {
    res.render("game", {context: {site: CONFIG.SITE, page: { title: "Game" + req.params.gameId }, game: doc, path: '/gameid/'}});
  });
});

// request for games
app.get("/g/:gameId/reqs/?", function(req, res) {
  res.render("request", {context: {site: CONFIG.SITE, page: { title: "Request" + req.params.gameId }, gameid: req.params.gameId, path: '/gameid/req'}});
});

app.get("/about/?", function(req, res) {
  res.render("about", {context: {site: CONFIG.SITE, page: { title: "About" }, path: '/about'}});
});

// start up server on given port
app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

