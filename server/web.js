// system reqs.
var PATH = require("path");
var SYS = require("sys");
// user reqs.
var express = require("express");
var expressNamespace = require("express-namespace");
var CONFIG = require("./config");
var SETTINGS = require("./settings");
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
  app.use(express.cookieParser());
  app.use(express.session({ secret: SETTINGS.AUTH.secret}));
  app.use(app.router);
  // serve static files out of /public
  app.use(express.static(PATH.join(CONFIG.WEBROOT, "public")));
});


function checkAuth(req, result, next) {
  if (req && (!req.session.userid || req.session.userid != SETTINGS.AUTH.username)) {
    var ctx = helpers.buildPageContext(req, result);
    result.render("login", ctx);
  } else {
    next();
  }
}


// homepage
app.get("/?", function(req, res) {
  api.game.list(function(result) {
    var month = (new Date()).getMonth();
    var year = (new Date()).getYear();
    
    result.games = result.games.filter(function(game) {
      var currYearPastMonth = ((new Date(game.date).getYear()) == year) && ((new Date(game.date).getMonth()) >= month);
      return ((game.status === "approved") && (currYearPastMonth || ((new Date(game.date).getYear()) > year)));
    });
    var ctx = helpers.buildPageContext(req, result);
    res.render("index", ctx);
  });
});

// all view
app.get("/views/all/:viewarea?", function(req, res) {
  api.game.list(function(result) {
    var month = (new Date()).getMonth();
    var va = req.params.viewarea;
    var isadmin = false;
    if (va)
    { 
      isadmin = true;
    } else {
      result.games = result.games.filter(function(game) {
        return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
      });
    }
    var ctx = helpers.buildPageContext(req, result, {
      layout: false,
      admin: isadmin
    });
    res.render("partials/gamelist", ctx);
  });
});

// available view
app.get("/views/available/:viewarea?", function(req, res) {
  api.game.listByAvailability(function(result) {
    var month = (new Date()).getMonth();
    var va = req.params.viewarea;
    var isadmin = false;
    if (va)
    { 
      isadmin = true;
    } else {
      result.games = result.games.filter(function(game) {
        return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
      });
    }
    var ctx = helpers.buildPageContext(req, result, {
      layout: false,
      admin: isadmin
    });
    res.render("partials/gamelist", ctx);
  });
});

// nights view
app.get("/views/nights/:viewarea?", function(req, res) {
  api.game.listByNights(function(result) {
    var month = (new Date()).getMonth();
    var va = req.params.viewarea;
    var isadmin = false;
    if (va)
    { 
      isadmin = true;
    } else {
      result.games = result.games.filter(function(game) {
        return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
      });
    }
    var ctx = helpers.buildPageContext(req, result, {
      layout: false,
      admin: isadmin
    });
    res.render("partials/gamelist", ctx);
  });
});

//weekend view
app.get("/views/weekends/:viewarea?", function(req, res) {
  api.game.listByWeekends(function(result) {
    var month = (new Date()).getMonth();
    var va = req.params.viewarea;
    var isadmin = false;
    if (va)
    { 
      isadmin = true;
    } else {
      result.games = result.games.filter(function(game) {
        return ((game.status === "approved") && ((new Date(game.date).getMonth()) >= month));
      });
    }
    var ctx = helpers.buildPageContext(req, result, {
      layout: false,
      admin: isadmin
    });
    res.render("partials/gamelist", ctx);
  });
});


app.post('/login/?', function (req, res) {
  if (req.body.userid == SETTINGS.AUTH.username && req.body.password == SETTINGS.AUTH.password) {
    req.session.userid = SETTINGS.AUTH.username;
    res.redirect('/admin/');
  } else {
    res.send('invalid username/password');
  }
});

app.get('/logout/?', function (req, res) {
  delete req.session.userid;
  res.redirect('/');
});

app.namespace("/admin", function() {

  // admin
  app.get("/?", checkAuth, function(req, res) {
    api.game.list(function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true
      });
      
      api.pricing.list(function(re) {
        re.games = result.games;
        var ctx = helpers.buildPageContext(req, re, {
          admin: true
        });
        res.render("index", ctx);
      });
     
    });
  });

  // pricing
  app.get("/pricing/?", checkAuth, function(req, res) {
    api.pricing.list(function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true
      });
      res.render("pricing", ctx);
    });
  });
  
  // pricing
  app.get("/pricing/plist/?", checkAuth, function(req, res) {
    api.pricing.list(function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true,
        layout: false
      });
      res.render("partials/pricinglist", ctx);
    });
  });

  app.post("/pricing/delete/:tierId/?", checkAuth, function(req, res) {
    api.pricing.remove(req.params.tierId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        res.redirect(req.headers.referer || "/admin");
      }
    });
  });

  app.get("/game/:gameId/?", checkAuth, function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true,
        layout: false
      });
      
       api.pricing.list(function(re) { 
        re.game = result.game;
        var ctx = helpers.buildPageContext(req, re, {
          admin: true,
          layout: false
        });
        res.render("partials/game", ctx);
      });
    
    });
  });

  app.get("/game/:year/:month/:day/?", checkAuth, function(req, res) {
    api.game.getByDate([req.params.month, req.params.day, req.params.year].join("/"), function(result) {
      var opponent = "";
      if (result && result.game && result.game.opponent)
        opponent = result.game.opponent;
    
      if (opponent && opponent.length > 0)
      {
        api.game.listByOpponent(opponent, function(re) {
  	      result.related = re;

	      result.related.games = result.related.games.filter(function(game) {
            return ((game.status === "approved"));
          });
	   
	      var ctx = helpers.buildPageContext(req, result, {
            admin: true
          });
          res.render("game", ctx);
	    });
	  } else {
	    var ctx = helpers.buildPageContext(req, result,  {
          admin: true
        });
        res.render("game", ctx);
      }
    });
  });

  app.get("/set/:gameId/price/:priceId/?", checkAuth, function(req, res) {    
    api.game.get(req.params.gameId, function(result) {
      api.pricing.get(req.params.priceId, function(r) {
      
        if (result.error) {
          res.end(JSON.stringify(result));
        } else {
          result.game.priceid = r.tier._id;
          result.game.price = r.tier.price;
          api.game.update(result.game, function(result) {
            res.redirect(req.headers.referer || "/admin");
          });
        }
      });
    });
  });

  app.get("/game/:gameId/approve/?", checkAuth, function(req, res) {    
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

  app.get("/game/:gameId/reject/?", checkAuth, function(req, res) {
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
});

// game by date
app.get("/game/:year/:month/:day/?", function(req, res) {
  api.game.getByDate([req.params.month, req.params.day, req.params.year].join("/"), function(result) {
    var opponent = "";
    if (result && result.game && result.game.opponent)
      opponent = result.game.opponent;
    
    if (opponent && opponent.length > 0)
    {
      api.game.listByOpponent(opponent, function(re) {
	    result.related = re;

	    result.related.games = result.related.games.filter(function(game) {
          return ((game.status === "approved"));
        });
	   
	    var ctx = helpers.buildPageContext(req, result);
        res.render("game", ctx);
	  });
	} else {
	  var ctx = helpers.buildPageContext(req, result);
      res.render("game", ctx);
	}
  });
});

// game by opponent
app.get("/games/:opponent/?", function(req, res) {
  api.game.listByOpponent(req.params.opponent, function(result) {
    var month = (new Date()).getMonth();
    var year = (new Date()).getYear();
    
    result.games = result.games.filter(function(game) {
      var currYearPastMonth = ((new Date(game.date).getYear()) == year) && ((new Date(game.date).getMonth()) >= month);
      return ((game.status === "approved") && (currYearPastMonth || ((new Date(game.date).getYear()) > year)));
    });
    var ctx = helpers.buildPageContext(req, result);
    res.render("index", ctx);
  });
});

// game by ids
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
  
    app.post("/game/all/seat/?", function(req, res) {
    api.game.list(function(result) {
      console.log(result.games);
      for (var key in result.games)
      {
        var game = result.games[key];
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
          game.seats.push(seat);
        
          console.log(game);
        
          api.game.update(game, function(result) {
            result.game = game;
            res.end(JSON.stringify(result));
          });
        }
      }
    });
  });
  
  app.post("/game/removeall/seat/?", function(req, res) {
    api.game.list(function(result) {
      for (var key in result.games)
      {
        var game = result.games[key];
        if (result.error) {
          res.end(JSON.stringify(result));
        } else {
          game.seats = [];
        
          api.game.update(game, function(result) {
            result.game = game;
            res.end(JSON.stringify(result));
          });
        }
      }
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
  
  app.post("/set/:gameId/price/:priceId/?", function(req, res) {
    console.log("gt here");
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        api.pricing.get(req.params.priceId, function(r) {
          if (r.error) {
            res.end(JSON.stringify(r));
          } else {
            result.game.priceid = r.tier._id;
            result.game.price = r.tier.price;
            
            api.game.update(result.game, function(result) {
              res.end(JSON.stringify(result));
            });
          }
        });
      }
    });
  });
  
  
  

  ////pricing
  app.post("/pricing/add/?", function(req, res) {
    var tier = {};
    tier.levelid = req.body.levelid;
    tier.price = req.body.price;
    tier.name = req.body.name;
    tier.shortname = req.body.shortname;
    tier.type = "pricing";
    
    api.pricing.update(tier, function(result) {
      res.end(JSON.stringify(result));
    });
  });
});

// start up server on given port
app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

