var PATH = require("path");

var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novembter", "December"];
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
