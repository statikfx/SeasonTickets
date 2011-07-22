// system reqs.
var PATH = require("path");
var SYS = require("sys");
// user reqs.
var express = require("express");
var expressNamespace = require("express-namespace");
var coffeekup = require("coffeekup");

// hold global configuration options
var CONFIG = {
  WEBROOT: PATH.dirname(__filename),
  PORT: process.env.PORT || 9999,
  DB: {
    URL: process.env.CUBS_DB || process.env.CLOUDANT_URL,
    NAME: "cubs"
  },
  SITE: {
    title: "Season Tickets"
  }
};

var helpers = require("./helpers")(CONFIG);
var db = require("./db/db")(CONFIG.DB);

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
  var view_obj = {
    startkey: helpers.dateToCouchString(helpers.yesterday())
  };
  db.view("games", "approved", view_obj, function(err, docs) {
    var ctx = helpers.buildPageContext(req, {
      games: docs.rows
    });
    res.render("index", ctx); 
  });
});

// game
app.get("/game/:gameId/?", function(req, res) {
  db.get(req.params.gameId, function(err, doc) {
    var ctx = helpers.buildPageContext(req, {
      game: doc
    });
    res.render("game", ctx);
  });
});

// request for games
app.get("/game/:gameId/request/?", function(req, res) {
  var ctx = helpers.buildPageContext(req);
  res.render("request", ctx);
});

// about page
app.get("/about/?", function(req, res) {
  var ctx = helpers.buildPageContext(req, {
    page: {
      title: "About"
    }
  });
  res.render("about", ctx);
});

// admin pages
app.namespace("/admin", function() {
  
  app.get("/", function(req, res) {
    db.view("games", "pending", function(err, docs) {
      var ctx = helpers.buildPageContext(req, {
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

