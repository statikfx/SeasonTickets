var URL = require("url");
var view_helpers = require("./view_helpers");
var CONFIG = require("./config");

module.exports = {
  buildPageContext: function(req, options) {
    var ctx = options || {};
    ctx.site = CONFIG.SITE;
    ctx.path = URL.parse(req.url).pathname;
    ctx.page = ctx.page || {};
    ctx.helpers = view_helpers;

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