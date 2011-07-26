var db = require("./db")();
var init = require("./init");

var main = function() {  
  var createDB = function() {
    console.log("CREATING DB...");
    
    db.create(function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      
      console.log("DB CREATED");
      
      init.createViews();
    });
  };
  
  var deleteDB = function() {
    console.log("DELETING DB...");
    
    db.delete(function(err, result) {
      if (err || result.error) {
        console.log(err || result.error);
        return;
      }
      
      console.log("DB DELETED");
      createDB();
    });
  };
  
  db.exists(createDB, deleteDB);
};


if (require.main === module) {
  main();
}