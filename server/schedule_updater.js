var SYS = require("sys");
var HTTP = require("http");
var CSV = require("csv");

var db = require("./db/db")();

var main = exports.main = function(fn) {
  console.log("UPDATING SCHEDULE");
  
  var callback = function(err, data) {
    if (fn) fn(err, data);
    console.log("SCHEDULE UPDATED");
  };
  
  var filter = function(line, index) {
    if (index === 0) return false;
    
    var date = line[0];
    var time = line[1];
    var opponent = line[3].split(" ")[0];
    var location = line[4];
    if (location.toLowerCase() !== "wrigley field") return false;
  
    return {
      date: date,
      time: time,
      opponent: opponent,
      location: location
    };
  };
  
  var options = {
    host: "mlb.mlb.com",
    path: "/soa/ical/schedule.csv?home_team_id=112&season=2011",
    port: 80
  };

  HTTP.get(options, function(res) {
    var data = "";
    res.on("data", function(chunk) {
      data += chunk;
    });
    res.on("end", function() {
      parseCSV(data, filter, callback);
    });
  });
};

var parseCSV = exports.parse = function(data, filter, callback) {
  var games = [];

  var csv = CSV();
  csv.from(data);
  csv.on("data", function(line, index) {
    var game = filter(line, index);
    if (game) {
      games.push(game);
    }
  });
  csv.on("end", function() {
    callback(null, games);
  });
};

var processGames = function(err, games) {
  for (var i = 0; i < games.length; i++) {
    games[i].status = "pending";
    games[i].type = "game";
  }
  db.load(games, function(err, result) {
    console.log(result);
  });
};

// if we are run from the command line
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
  
  // print help and return
  if (argv.h) {
    optimist.showHelp();
    return;
  }
  
  if (!argv.s) {
    // no schedule argument, run and exit
    main(processGames);
  } else {
    // schedule the job to run with given time string
    new require("cron").CronJob(argv.s, function() {
      main(processGames);
    });
  }
}