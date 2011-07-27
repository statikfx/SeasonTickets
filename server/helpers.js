var URL = require("url");
var view_helpers = require("./view_helpers");
var CONFIG = require("./config");

module.exports = {
  // builds an object to be passed to the render function
  buildPageContext: function(/* HTTPRequest, obj1, obj2, ...*/) {
    var args = Array.prototype.slice.call(arguments);
    var req = args[0];
    var ctx = {};
    ctx.site = CONFIG.SITE;
    ctx.path = URL.parse(req.url).pathname;
    ctx.helpers = view_helpers;
    
    for (var i = 1; i < args.length; i++) {
      var arg = args[i];
      for (var prop in arg) {
        if (arg.hasOwnProperty(prop)) {
          ctx[prop] = arg[prop];
        }
      }
    }
    
    ctx.page = ctx.page || {};
    
    return { context: ctx };
  },
  
  dateToCouchString: function(date) {
    var str = [(date.getMonth() + 1), date.getDate(), date.getFullYear()];
    if (str[0] < 10) {
      str[0] = "0" + str[0];
    }
    if (str[1] < 10) {
      str[1] = "0" + str[1];
    }
    str = str.join("/");
    return str;
  },
  
  yesterday: function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  },
  
  cleanUpCouchResults: function(rows) {
    return rows.map(function(row) { return row.value; });
  }
};