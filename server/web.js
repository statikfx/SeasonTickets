// system reqs.
var PATH = require("path");
var SYS = require("sys");
// user reqs.
var express = require("express");
var expressNamespace = require("express-namespace");
var coffeekup = require("coffeekup");
var CONFIG = require("./config");
var helpers = require("./helpers");
var db = require("./db/db")();

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
  app.use(express.bodyParser());
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
      games: helpers.cleanUpCouchResults(docs.rows)
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
    db.view("games", "all_by_date", function(err, docs) {
      var ctx = helpers.buildPageContext(req, {
        games: helpers.cleanUpCouchResults(docs.rows),
        page: {
          title: "Admin"
        },
        admin: true
      });
      res.render("index", ctx); 
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
  
  app.post("/seat/?", function(req, res) {    
    var seat = {
      section: req.body.section,
      row: req.body.row,
      seat: req.body.seat,
      price: req.body.price,
      status: "open",
      requests: []
    };
    
      
    db.get(req.body.gameId, function(err, game) {
      if (err || game.error) {
        console.log(err);
        return;
      }
      
      game.seats.push(seat);
      db.save(game, function(err, doc) {
        if (err || doc.error) {
          console.log(err);
          return;
        }
        
        console.log("SEAT ADDED " + doc._id);
        res.redirect("/admin");
      });
    });
  });
  
});

// start up server on given port
app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

