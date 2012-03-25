// system reqs.
var PATH = require("path");
var SYS = require("util");
// user reqs.
var express = require("express");
var expressNamespace = require("express-namespace");
var CONFIG = require("./config");
var helpers = require("./helpers");
var db = require("./db/db")();
var api = require("./api");

// create server
var app = express.createServer();
var cubs_app = express.createServer();

cubs_app.use(CONFIG.BASEPATH, app);

function isMobile(req) {
    var ua = req.header('user-agent');
    if (/mobile/i.test(ua)) return true;
    else return false;
};


// configure express options -- order matters
app.configure(function() {
  // view rendering config
  app.set("views", PATH.join(CONFIG.WEBROOT, "views"));
  app.set("view engine", "jade");
  app.set("view options", {
    layout: true,
    pretty: true
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
    var year = (new Date()).getYear();
    
    result.games = result.games.filter(function(game) {
      var currYearPastMonth = ((new Date(game.date).getYear()) == year) && ((new Date(game.date).getMonth()) >= month);
      return ((game.status === "approved") && (currYearPastMonth || ((new Date(game.date).getYear()) > year)));
    });
 
    var ctx = helpers.buildPageContext(req, result,
    {
      mobile: isMobile(req)
    });
    res.render("index", ctx);
  });
});

  // requests
app.namespace("/requests", function() {
  app.post("/add/:id/?", function(req, res) {
    api.game.get(req.params.id, function(result) {  
  	  if (result.error) {
	    res.end(JSON.stringify(result));
	    console.log("error");
          } else {
	    var request = {};
	    request.name = req.body.name;
	    request.email = req.body.email;
	    request.price = req.body.price;
	    request.date = new Date();

  	    result.game.requests.push(request);
	
        api.game.update(result.game, function(result) {
		  res.end(JSON.stringify(result));
	    });
      }
    });
  });

  app.get("/get/:id/?", function(req, res) {
    api.game.get(req.params.id, function(result) {
      if (result.error) {
      } else {
        console.log(result);
        result.requests = result.game.requests; 
        var ctx = helpers.buildPageContext(req, result, {
          mobile: isMobile(req),  
          layout: false
        });
        res.render("partials/requests", ctx);
      }
    });
  });

  app.get("/clear/:id/?", function(req, res) {
    api.game.get(req.params.id, function(result) {
      if (result.error) {
      } else {
        result.game.requests = [];
        api.game.update(result.game, function (result) {
          res.end(JSON.stringify(result));
        }); 
      }
    });
  });

});

app.namespace("/admin", function() {

  // admin
  app.get("/?", function(req, res) {
    api.game.list(function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true
      });
      
      api.pricing.list(function(re) {
        re.games = result.games;
        var ctx = helpers.buildPageContext(req, re, {
          admin: true,
          mobile: isMobile(req)
        });
        res.render("index", ctx);
      });
     
    });
  });
  
  app.get("/refresh/games/all/?", function(req, res) {
    api.game.list(function(result) {
      api.pricing.list(function(re) {
        re.games = result.games;
        var ctx = helpers.buildPageContext(req, re, {
          admin: true,
          layout: false,
          mobile: isMobile(req)
        });
        res.render("partials/gamelist", ctx);
      });
    });
  });

  // pricing
  app.get("/pricing/?", function(req, res) {
    api.pricing.list(function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true,
        mobile: isMobile(req)
      });
      res.render("pricing", ctx);
    });
  });
  
  // pricing
  app.get("/pricing/plist/?", function(req, res) {
    api.pricing.list(function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true,
        layout: false,
        mobile: isMobile(req)
      });
      res.render("partials/pricinglist", ctx);
    });
  });

  app.get("/pricing/delete/:tierId/?", function(req, res) {
    api.pricing.remove(req.params.tierId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        res.redirect(req.headers.referer || "/admin");
      }
    });
  });

  app.get("/game/:gameId/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      var ctx = helpers.buildPageContext(req, result, {
        admin: true,
        layout: false,
        mobile: isMobile(req)
      });
      
       api.pricing.list(function(re) { 
        re.game = result.game;
        var ctx = helpers.buildPageContext(req, re, {
          admin: true,
          layout: false,
          mobile: isMobile(req)
        });
        res.render("partials/game", ctx);
      });
    
    });
  });

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
	   
	  var ctx = helpers.buildPageContext(req, result, {
            admin: true,
            mobile: isMobile(req)
          });
          res.render("game", ctx);
	    });
	  } else {
	var ctx = helpers.buildPageContext(req, result,  {
          admin: true,
          mobile: isMobile(req)
        });
        res.render("game", ctx);
      }
    });
  });

  app.get("/set/:gameId/price/:priceId/?", function(req, res) {    
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

  app.get("/game/:gameId/approve/?", function(req, res) {    
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

  app.get("/game/:gameId/open/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        result.game.closed = "N";
        api.game.update(result.game, function(result) {
          res.redirect(req.headers.referer || "/admin");
        });
      }
    });
  });

  app.get("/game/:gameId/reject/?", function(req, res) {
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
	   
	var ctx = helpers.buildPageContext(req, result, {
          mobile: isMobile(req)
        });
        res.render("game", ctx);
	  });
     } else {
       var ctx = helpers.buildPageContext(req, result, {
         mobile: isMobile(req)
       });
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
    var ctx = helpers.buildPageContext(req, result, {
      mobile: isMobile(req)
    });
    res.render("index", ctx);
  });
});

// game by ids
app.get("/game/:gameId/?", function(req, res) {
  api.game.get(req.params.gameId, function(result) {
    var ctx = helpers.buildPageContext(req, result, {
      mobile: isMobile(req)
    });
    res.render("game", ctx);
  });
});

// request for games
app.get("/game/:gameId/request/?", function(req, res) {
  var ctx = helpers.buildPageContext(req, {
    mobile: isMobile(req)
  });
  res.render("request", ctx);
});

// about page
app.get("/about/?", function(req, res) {
  var ctx = helpers.buildPageContext(req, {
    page: {
      title: "About"
    },
    mobile: isMobile(req)
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
          game.seats.push(seat);
        
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

  app.post("/game/:gameId/open/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        result.game.closed = "N";
        api.game.update(result.game, function(result) {
          res.end(JSON.stringify(result));
        });
      }
    });
  });

  app.post("/game/:gameId/close/?", function(req, res) {
    api.game.get(req.params.gameId, function(result) {
      if (result.error) {
        res.end(JSON.stringify(result));
      } else {
        result.game.closed = "Y";
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

        result.game.seats.push(seat);
        
        api.game.update(result.game, function(result) {
          res.end(JSON.stringify(result));
        });
      }
    });
  });
  
  app.post("/set/:gameId/price/:priceId/?", function(req, res) {
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

app.use(function(req, res, next){
  var ctx = helpers.buildPageContext(req, res);
  res.render('404', ctx);
});

// start up server on given port
cubs_app.listen(CONFIG.PORT, function() {
  console.log("Express listening on port " + CONFIG.PORT);
  console.log("Configuration: ");
  console.log(SYS.inspect(CONFIG));
});

