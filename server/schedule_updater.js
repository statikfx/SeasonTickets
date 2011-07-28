var SYS = require("sys");
var HTTP = require("http");
var CSV = require("csv");

var db = require("./db/db")();

var main = exports.main = function(fn) {
  console.log("UPDATING SCHEDULE");
  
  var callback = function(err, data) {
    if (fn) fn(err, data, function() {
      console.log("SCHEDULE UPDATED");
    });
  };
  
  var process = function(line) {
    var game = {
      date: line["START_DATE"],
      time: line["START_TIME"],
      opponent: line["SUBJECT"].split(" at ")[0],
      location: line["LOCATION"],
      type: "game",
      status: "pending",
      seats: []
    };
    
    return game;
  };
  
  var filter = function(game) {
    return (game.location.toLowerCase() === "wrigley field");
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
      parseCSV(data, process, filter, callback);
    });
    res.on("error", function(err) {
      callback(err);
    });
  });
};

var parseCSV = exports.parse = function(data, process, filter, callback) {
  var games = [];

  var csv = CSV();
  csv.from(data, { columns: true });
  csv.transform(function(line) {
    var game = process(line);
    return (filter(game) ? game : null);
  });
  csv.on("data", function(game) {
    games.push(game);
  });
  csv.on("end", function() {
    callback(null, games.filter(filter));
  });
  csv.on("error", function(err) {
    callback(err);
  });
};

var loadGames = function(err, games, callback) {
  if (err) {
    throw err;
  }
  
  db.load(games, function(err, result) {
    if (err) {
      throw err;
    }
    callback();
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
    main(loadGames);
  } else {
    // schedule the job to run with given time string
    new require("cron").CronJob(argv.s, function() {
      main(loadGames);
    });
  }
}