var SYS = require("sys");
var HTTP = require("http");
var CSV = require("csv");

var main = exports.main = function(fn) {
  console.log("UPDATING SCHEDULE");
  
  var callback = function() {
    console.log("SCHEDULE UPDATED");
    if (fn) fn();
  };
  
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
      parseCSV(data, callback);
    });
  });
};

var parseCSV = exports.parse = function(data, fn) {
  var games = [];

  var csv = CSV();
  csv.from(data);
  csv.on("data", function(line, index) {
    if (index === 0) return;
    var date = new Date(line[0] + " " + line[1]);
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
    fn();
  })
};

if (require.main === module) {
  var optimist = require("optimist")
    .usage("Requests a CSV file and inserts new/changed entries in DB.")
    .options("s", {
      alias: "schedule",
      describe: "Schedule to run as a cron job. Expects a cron time format string."
    })
    .options("h", {
      alias: "help",
      describe: "Prints this help message."
    });
  var argv = optimist.argv;
  
  if (argv.h) {
    optimist.showHelp();
    return;
  }
  
  if (!argv.s) {
    main();
  } else {
    new require("cron").CronJob(argv.s, function() {
      main();
    });
  }
}