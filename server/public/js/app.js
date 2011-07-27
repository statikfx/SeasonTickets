$(function() {
  $(".month > h1").click(function() {
    // unhide and series
    $(this).parent().children(".series").children(".game").removeClass("hidden");
    $(this).parent().children(".series").children("h1").removeClass("hiding");
    
    $(this).toggleClass("hiding");
    $(this).parent().children(".series").toggleClass("hidden");
  });
  
  $(".series > h1").click(function() {
    $(this).toggleClass("hiding");
    $(this).parent().children(".game").toggleClass("hidden");
  });
  
  // is admin
  if ($("body").hasClass("admin")) {
    // seat editor
    $("a[href=#add-seat]").live("click", function(evt) {
      var seat_editor = $("#seat-editor");
      seat_editor.remove();
      seat_editor[0].reset();
      
      $(this).parent().parent().after(seat_editor);
      seat_editor.removeClass("hidden");
      
      var gameId = $(this).parent().parent().attr("id");
      seat_editor.attr("action", "/api/game/" + gameId + "/seat/");
      
      evt.preventDefault();
    });
    
    // cancel form
    $("#seat-editor-cancel").live("click", function(evt) {
      $("#seat-editor").addClass("hidden");
      evt.preventDefault();
    });
    
    // make form submission asynchronous
    $("#seat-editor").live("submit", function(evt) {
      var that = $(this);

      var url = $(this).attr("action");
      var type = $(this).attr("method");
      var data = $(this).serialize();
      
      var submit = $("#seat-editor input[type=submit]");
      var previousTitle = submit.val();
      submit.attr("disabled", true);
      submit.val("Working...");
      
      var reset = function() {
        submit.attr("disabled", false);
        submit.val(previousTitle);
      };
      
      $.ajax({
        url: url,
        type: type,
        data: data,
        success: function() {
          reset();
          that.addClass("hidden");
        },
        error: function() {
          reset();
          alert("Whoops. There was a problem adding the seat.");
        }
      });
      
      evt.preventDefault();
    });
    
    // hide all months before today
    var MONTHS = {
      "January": 0, "February": 1, "March": 2,
      "April": 3, "May": 4, "June": 5, "July": 6,
      "August": 7, "September": 8, "October": 9,
      "November": 10, "December": 11
    };
    var currentMonth = (new Date()).getMonth();
    $(".month").each(function() {
      var month = $(this).attr("id");
      month = MONTHS[month];
      if (month < currentMonth) {
        $(this).children(".series").addClass("hidden");
        $(this).children("h1").addClass("hiding");
      }
    });
    
    // ajaxyify approval/rejection links
    $("a.approve").live("click", function(evt) {
      var gameEl = $(this).parent().parent();
      var gameId = gameEl.attr("id");
      console.log(gameId);
      
      var url = "/api/game/" + gameId + "/approve/";
      $.ajax({
        url: url,
        type: "POST",
        success: function() {
          alert("SUCCESS");
        },
        error: function() {
          alert("Whoops. There was a problem approving the game.");
        }
      });
      
      evt.preventDefault();
    });
    
    $("a.reject").live("click", function(evt) {
      var gameEl = $(this).parent().parent();
      var gameId = gameEl.attr("id");
      
      var url = "/api/game/" + gameId + "/reject/";
      $.ajax({
        url: url,
        type: "POST",
        success: function() {
          alert("SUCCESS");
        },
        error: function() {
          alert("Whoops. There was a problem rejecting the game.");
        }
      });
      
      evt.preventDefault();
    });
  }
});