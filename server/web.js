// system reqs.
var PATH = require("path");
var SYS = require("sys");
// user reqs.
var express = require("express");
var coffeekup = require("coffeekup");


// hold global configuration options
var CONFIG = {
  WEBROOT: PATH.dirname(__filename),
  PORT: process.env.PORT || 9999
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
    layout: false
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
  res.render('index', {context: {title: 'Season Tickets 2011', path: '/'}}); 
});

// request
app.get("/:gameId/requests", function(req, res) {
  res.end(req.params.gameId);
});

// start up server on given port
app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

