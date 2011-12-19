var PATH = require("path");
var SYS = require("sys");
var couch = require("couch-client");
var CONFIG = require("../config");

var db = module.exports = function() {
  var url = CONFIG.DB.URL;
  var database = CONFIG.DB.NAME;
  
  if (!url) {
    throw "No DB URL. Check your environment variables.";
  }
  
  if (database.indexOf("/") !== 0) {
    database = "/" + database;
  }
  
  url = url + database;
  var that = couch(url);
  that.database = database;
  
  that.load = function(items, callback) {
    this.request("POST", PATH.join(database, "_bulk_docs"), { docs: items }, callback);
  };
  
  that.exists = function(does_not_exist_callback, exists_callback) {
    this.request("GET", database, null, function(err, doc) {
      if (err || doc.error) {
        does_not_exist_callback();
      } else {
        exists_callback();
      }
    });
  };
  
  that.create = function(callback) {
    this.request("PUT", database, null, function(err, doc) {
      callback(err, doc);
    });
  };
  
  that["delete"] = function(callback) {
    this.request("DELETE", database, null, function(err, result) {
      callback(err, result);
    });
  };
  
  var old_view = that.view;
  that.view = function(design, view, obj, callback) {
    var path = PATH.join("/" + database, "_design", design, "_view", view);
    old_view(path, obj, callback);
  };
  
  var old_save = that.save;
  that.save = function(obj, callback) {
    if (!obj._id) {
      old_save(obj, callback);
      return;
    }
    
    this.get(obj._id, function(err, doc) {
      if (err || doc.error) {
        old_save(obj, callback);
        return;
      }
      
      for (var key in obj) {
        doc[key] = obj[key];
      }
      
      old_save(doc, callback);
    });
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
  
// pricing
  // id
  // type = pricing
  // name
  // price
  // levelid