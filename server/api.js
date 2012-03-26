var db = require("./db/db")();
var helpers = require("./helpers");

var create

var api = module.exports = {
  createResponse: function(err, data) {
    var response = {};
    if (err || (data && data.error)) {
      response.error = (err && err.mesage) || (data && data.error) || "UNKNOWN ERROR";
    }
    
    return response;
  },

  requests: {
    get: function(id, callback) {
      db.get(id, function(err, reqs) {
        var response = api.createResponse(err, reqs);
        if (reqs) {
          response.requests = helpers.cleanUpCouchResults(reqs);
        }

        callback(response);
      });
    },
    
    oneOrMore: function(callback) {
      db.view("games", "games_with_1ormore_requests", function(err, result) {
        var response = api.createResponse(err, result);
        if (result) {
          response.games = helpers.cleanUpCouchResults(result.rows);
        }

        callback(response);
      });  
    },
  },
  
  
  pricing: {
    list: function(callback) {
      db.view("games", "pricing", function(err, result) {
        var response = api.createResponse(err, result);
        
        if (result) {
          response.pricing = helpers.cleanUpCouchResults(result.rows);
        }
        
        callback(response);
      });
    },
    
    get: function(id, callback) {
      db.get(id, function(err, tier) {
        var response = api.createResponse(err, tier);
        if (tier) {
          response.tier = tier;
        }

        callback(response);
      });
    },
    
    update: function(obj, callback) {
      db.save(obj, function(err, tier) {
        var response = api.createResponse(err, tier);
        if (tier) {
          response.tier = tier;
        }

        callback(response);
      });
    }, 
    
    remove: function(obj, callback) {
      db.remove(obj, function(err, tier) {
        var response = api.createResponse(err, tier);
        callback(response);
      });
    }
  },
  
  game: {
    list: function(callback) {
      db.view("games", "all_by_date", function(err, result) {
        var response = api.createResponse(err, result);
        if (result) {
          response.games = helpers.cleanUpCouchResults(result.rows);
        }
        
        callback(response);
      });
    },
    
    getByDate: function(date, callback) {
      db.view("games", "all_by_date", { key: date }, function(err, game) {
        var response = api.createResponse(err, game);
        if (game && game.rows && game.rows.length > 0) {
          response.game = game.rows[0].value;
        }
        
        callback(response);
      }); 
    },
    
    listByOpponent: function(opponent, callback) {
      db.view("games", "all_by_opponent", { key: opponent }, function(err, game) {
        var response = api.createResponse(err, game);
        if (game && game.rows && game.rows.length > 0) {
          response.games =  helpers.cleanUpCouchResults(game.rows);
        }
        
        callback(response);
      }); 
    },
    
    listByAvailability: function(callback) {
      db.view("games", "available", function(err, result) {
        var response = api.createResponse(err, result);
        if (result) {
          response.games = helpers.cleanUpCouchResults(result.rows);
        }
        
        callback(response);
      });
    },
    
    listByNights: function(callback) {
      db.view("games", "nights", function(err, result) {
        var response = api.createResponse(err, result);
        if (result) {
          response.games = helpers.cleanUpCouchResults(result.rows);
        }
        
        callback(response);
      });
    },
    
    listByWeekends: function(callback) {
      db.view("games", "weekends", function(err, result) {
        var response = api.createResponse(err, result);
        if (result) {
          response.games = helpers.cleanUpCouchResults(result.rows);
        }
        
        callback(response);
      });
    },

    get: function(id, callback) {
      db.get(id, function(err, game) {
        var response = api.createResponse(err, game);
        if (game) {
          response.game = game;
        }

        callback(response);
      });
    },
    
    update: function(obj, callback) {
      db.save(obj, function(err, game) {
        var response = api.createResponse(err, game);
        if (game) {
          response.game = game;
        }

        callback(response);
      });
    }
  }
};
