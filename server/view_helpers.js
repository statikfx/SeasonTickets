var PATH = require("path");

var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var SHORTMONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var SHORTDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

module.exports = {
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
  
  getMonthDayNum: function(date) {
    var day = this.getDayOfDate(date);
    var month = date.getMonth(date);
    if (month < 10)
      month = "0" + month;
    var year = date.getFullYear(date);
    
    return month + "/" + day + "/" + year;
  },
  
  getFullDate: function(date) {
    var day = this.getDayOfDate(date);
    var shortDay = SHORTDAYS[date.getDay()];
    var shortMonth = SHORTMONTHS[date.getMonth()];
    var year = date.getFullYear(date);
    
    return shortDay + " " + shortMonth + " " + day + " " + year;
  },

  getDayOfWeekOfDate: function(date, shortName) {
    if (shortName) return SHORTDAYS[date.getDay()];

    return DAYS[date.getDay()];
  },
  
  getDateForURL: function(date) {
	var month = (new Date(date)).getMonth() + 1;
    var day = (new Date(date)).getDate();
    var year = (new Date(date)).getFullYear();
    if (month < 10)
      month = "0" + month;
    if (day < 10)
      day = "0" + day;
      
    return year + '/' + month + '/' + day;
  },
  
  appendBaseURL: function(append1, append2) {
    return PATH.join("/cubs", append1, append2);
  },
  
  urlJoin: PATH.join
};
