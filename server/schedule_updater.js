var SYS = require("sys");
var HTTP = require("http");
var CSV = require("csv");

var options = {
  host: "mlb.mlb.com",
  path: "/soa/ical/schedule.csv?home_team_id=112&season=2011",
  port: 80
}

HTTP.get(options, function(res) {
  var data = "";
  res.on("data", function(chunk) {
    data += chunk;
  });
  res.on("end", function() {
    parseCSV(data);
  })
});

var parseCSV = function(data) {
  var games = [];
  
  var csv = CSV();
  csv.from(data);
  csv.on("data", function(line, index) {
    if (index === 0) return;
    var date = new Date(line[0] + " " + line[1]);
    if (date.getHours() < 17 && date.getDay() < 5) return;
    var opponent = line[3].split(" ")[0];
    var location = line[4];
    if (location.toLowerCase() !== "wrigley field") return;
    
    games.push({
      date: date,
      opponent: opponent,
      location: location
    });
  });
  csv.on("end", function() {
    for (var i = 0; i < games.length; i++) {
      console.log(games[i].date + ": " + games[i].opponent + ", " + games[i].location);
    }
  })
};