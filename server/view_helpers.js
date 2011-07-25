var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novembter", "December"];
var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
  
  getDayOfWeekOfDate: function(date) {
    return DAYS[date.getDay()];
  }
};