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
    
    listUnder30: function(callback) {
      db.view("games", "under30", function(err, result) {
        var response = api.createResponse(err, result);
        if (result) {
          response.games = helpers.cleanUpCouchResults(result.rows);
        }
        
        callback(response);
      });
    },
    
    listUnder50: function(callback) {
      db.view("games", "under50", function(err, result) {
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
