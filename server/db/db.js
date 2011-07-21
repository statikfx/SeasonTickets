var PATH = require("path");
var SYS = require("sys");
var couch = require("couch-client");

var CONFIG = {
  URL: process.env.CUBS_DB || process.env.CLOUDANT_URL,
  DB: "cubs"
}

var db = module.exports = function() {
  var url = CONFIG.URL;
  var database = CONFIG.DB
  
  if (database.indexOf("/") !== 0) {
    database = "/" + database;
  }
  
  url = url + database;
  var that = couch(url);
  that.database = database;
  
  that.load = function(items, callback) {
    this.request("POST", PATH.join(database, "_bulk_docs"), { docs: items }, callback);
  };
  
  that.exists = function(callback) {
    this.request("GET", database, null, function(err, doc) {
      if (err || doc.error) {
        callback(false);
      } else {
        callback(true);
      }
    });
  };
  
  that.create = function(callback) {
    this.request("PUT", database, null, function(err, doc) {
      callback(err, doc);
    });
  };
  
  var old_view = that.view;
  that.view = function(design, view, obj, callback) {
    var path = PATH.join("/" + database, "_design", design, "_view", view);
    old_view(path, obj, callback);
  };
  
  return that;
};

// game
  // id
  // date
  // opponent
  // status (pending, approved, deleted)
  // seats[]
  // type = game
  
// request
  // id
  // game
  // date
  // name
  // email
  // type = request

// seat
  // id
  // name
  // price
  // status (open, taken)
  // requests[]
  // type = seat