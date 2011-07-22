var URL = require("url");

var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novembter", "December"];
var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var VIEW_HELPERS = {
  getMonthOfDate: function(date) {
    return MONTHS[date.getMonth()];
  },
  
  getDayOfDate: function(date) {
    var day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    return day;
  },
  
  getDayOfWeekOfDate: function(date) {
    return DAYS[date.getDay()];
  }
};

module.exports = function(config) {
  return {
    
    buildPageContext: function(req, options) {
      var ctx = options || {};
      ctx.site = config.SITE;
      ctx.path = URL.parse(req.url).pathname;
      ctx.page = ctx.page || {};
      ctx.helpers = VIEW_HELPERS;

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
    }
  };
};