// system reqs.
var PATH = require("path");
var SYS = require("sys");
var URL = require("url");
// user reqs.
var express = require("express");
var expressNamespace = require("express-namespace");
var coffeekup = require("coffeekup");
var db = require("./db/db")();


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

var buildPageContext = function(req, options) {
  var ctx = options || {};
  ctx.site = CONFIG.SITE;
  ctx.path = URL.parse(req.url).pathname;
  ctx.page = ctx.page || {};
  
  return { context: ctx };
};

// homepage
app.get("/", function(req, res) {
  db.view("games", "approved", function(err, docs) {
    var ctx = buildPageContext(req, {
      games: docs.rows
    });
    res.render("index", ctx); 
  });
});

// game
app.get("/game/:gameId/?", function(req, res) {
  db.get(req.params.gameId, function(err, doc) {
    var ctx = buildPageContext(req, {
      game: doc
    });
    res.render("game", ctx);
  });
});

// request for games
app.get("/game/:gameId/request/?", function(req, res) {
  var ctx = buildPageContext(req);
  res.render("request", ctx);
});

app.get("/about/?", function(req, res) {
  var ctx = buildPageContext(req, {
    page: {
      title: "About"
    }
  });
  res.render("about", ctx);
});

app.namespace("/admin", function() {
  
  app.get("/", function(req, res) {
    db.view("games", "pending", function(err, docs) {
      var ctx = buildPageContext(req, {
        games: docs.rows,
        page: {
          title: "Admin"
        }
      });
      res.render("admin", ctx); 
    });
  });
  
  app.get("/reject/:gameId/?", function(req, res) {
    var obj = {
      "_id": req.params.gameId,
      "status": "rejected"
    };
    
    db.save(obj, function(err, doc) {
      if (err || doc.error) {
        console.log(err || doc.error);
        return;
      }
      
      console.log("REJECTED " + doc._id);
      res.redirect("/admin");
    });
  });
  
  app.get("/approve/:gameId/?", function(req, res) {
    var obj = {
      "_id": req.params.gameId,
      "status": "approved"
    };
    
    db.save(obj, function(err, doc) {
      if (err || doc.error) {
        console.log(err || doc.error);
        return;
      }
      
      console.log("APPROVED " + doc._id);
      res.redirect("/admin");
    });
  });
  
});

// start up server on given port
app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

