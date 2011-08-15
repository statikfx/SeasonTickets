// system reqs.
var PATH = require("path");
var SYS = require("sys");
// user reqs.
var express = require("express");
var expressNamespace = require("express-namespace");
var CONFIG = require("./config");
var helpers = require("./helpers");
var db = require("./db/db")();
var api = require("./api");

// create server
var app = express.createServer();

// configure express options -- order matters
app.configure(function() {
  // view rendering config
  app.set("views", PATH.join(CONFIG.WEBROOT, "views"));
  app.set("view engine", "jade");
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
app.get("/?", function(req, res) {
  api.game.list(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result);
    res.render("index", ctx);
  });
});

// all view
app.get("/views/all/?", function(req, res) {
  api.game.list(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result, {
      layout: false
    });
    res.render("partials/gamelist", ctx);
  });
});

// available view
app.get("/views/available/?", function(req, res) {
  api.game.listByAvailability(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result, {
      layout: false
    });
    res.render("partials/gamelist", ctx);
  });
});

// nights view
app.get("/views/nights/?", function(req, res) {
  api.game.listByNights(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result, {
      layout: false
    });
    res.render("partials/gamelist", ctx);
  });
});

//weekend view
app.get("/views/weekends/?", function(req, res) {
  api.game.listByWeekends(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result, {
      layout: false
    });
    res.render("partials/gamelist", ctx);
  });
});

//under30 view
app.get("/views/u30/?", function(req, res) {
  api.game.listUnder30(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result, {
      layout: false
    });
    res.render("partials/gamelist", ctx);
  });
});

//under50 view
app.get("/views/u50/?", function(req, res) {
  api.game.listUnder50(function(result) {
    var month = (new Date()).getMonth();
    result.games = result.games.filter(function(game) {
      return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
    });
    var ctx = helpers.buildPageContext(req, result, {
      layout: false
    });
    res.render("partials/gamelist", ctx);
  });
});

// admin
app.get("/admin/?", function(req, res) {
  api.game.list(function(result) {
    var ctx = helpers.buildPageContext(req, result, {
      admin: true
    });
    res.render("index", ctx);
  });
});

app.get("/admin/game/:gameId/?", function(req, res) {
  api.game.get(req.params.gameId, function(result) {
    var ctx = helpers.buildPageContext(req, result, {
      admin: true,
      layout: false
    });
    res.render("partials/game", ctx);
  });
});

app.get("/admin/game/:gameId/approve/?", function(req, res) {    
  api.game.get(req.params.gameId, function(result) {
    if (result.error) {
      res.end(JSON.stringify(result));
    } else {
      result.game.status = "approved";
      api.game.update(result.game, function(result) {
        res.redirect(req.headers.referer || "/admin");
      });
    }
  });
});

app.get("/admin/game/:gameId/reject/?", function(req, res) {
  api.game.get(req.params.gameId, function(result) {
    if (result.error) {
      res.end(JSON.stringify(result));
    } else {
      result.game.status = "rejected";
      api.game.update(result.game, function(result) {
        res.redirect(req.headers.referer || "/admin");
      });
    }
  });
});

// game
app.get("/game/:gameId/?", function(req, res) {
  api.game.get(req.params.gameId, function(result) {
    var ctx = helpers.buildPageContext(req, result);
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

app.namespace("/api", function() {
  
  app.get("/game/?", function(req, res) {
    api.game.list(function(result) {
      res.end(JSON.stringify(result));
    });
  });
  
  app.get("/game/:gameId/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      res.end(JSON.stringify(result));
    });
  });
  
  app.post("/game/:gameId/approve/?", function(req, res) {    
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        result.game.status = "approved";
        api.game.update(result.game, function(result) {
          res.end(JSON.stringify(result));
        });
      }
    });
  });

  app.post("/game/:gameId/reject/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        result.game.status = "rejected";
        api.game.update(result.game, function(result) {
          res.end(JSON.stringify(result));
        });
      }
    });
  });
  
  app.post("/game/:gameId/seat/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        var seat = {};
        seat.section = req.body.section;
        seat.row = req.body.row;
        seat.seat = req.body.seat;
        seat.price = req.body.price;
        seat.requests = [];
        console.log(seat);
        result.game.seats.push(seat);
        
        api.game.update(result.game, function(result) {
          res.end(JSON.stringify(result));
        });
      }
    });
  });

});

// start up server on given port
app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

