var PATH = require("path");
var SYS = require("sys");
var couch = require("couch-client");

var db = module.exports = function(url, database) {  
  url = PATH.join(url, database);
  if (url.indexOf("/") !== 0) {
    url = "/" + url;
  }
  var that = couch(url);
  that.database = database;
  
  that.load = function(items, callback) {
    this.request("POST", PATH.join("/" + database, "_bulk_docs"), { docs: items }, callback);
  };
  
  var old_view = that.view;
  that.view = function(design, view, obj, callback) {
    var path = PATH.join("/" + database, "_design", design, "_view", view);
    console.log(path);
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