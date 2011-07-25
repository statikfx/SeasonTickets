var FS = require("fs");
var PATH = require("path");
var SYS = require("sys");
var db = require("./db")();

var main = function() {
  db.exists(function(exists) {
    if (!exists) {
      db.create(function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
        createViews();
      });
    } else {
      createViews();
    }
  });
};

var createViews = function() {
  var base = "views";
  var basePath = PATH.join(PATH.dirname(__filename), base);
  FS.readdir(basePath, function(err, dirs) {
    if (err) {
      console.log(err);
      return;
    }
    
    var designs = [];
    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i];

      if (dir.indexOf(".") === -1) {
        FS.readdir(PATH.join(basePath, dir), function(err, files) {
          var design = {};
          design["_id"] = "_design/" + dir;
          design.views = {};
          
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var contents = FS.readFileSync(PATH.join(PATH.join(basePath, dir), file), "utf8");
            var name = file.split(".");
            name.pop();
            name = name.join(".");
            design.views[name] = {
                "map": contents
            };
          }
          
          db.save(design, function(err, doc) {
            if (err) {
              console.log(err);
              return;
            }
            
            console.log("VIEWS CREATED SUCCESSFULLY");
          });
        });
      }
    }
  });
};

main();