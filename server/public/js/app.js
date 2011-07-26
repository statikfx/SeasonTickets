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
  
  if (ADMIN) {
    // seat editor
    $("a[href=#add-seat]").each(function() {
      $(this).click(function(evt) {
        var seat_editor = $("#seat-editor");
        seat_editor.remove();
        seat_editor[0].reset();
        
        $(this).parent().parent().after(seat_editor);
        seat_editor.removeClass("hidden");
        
        var gameId = $(this).parent().parent().attr("id");
        $("#seat-editor-game-id").val(gameId);
        
        $("#seat-editor-cancel").click(function(evt) {
          seat_editor.addClass("hidden");
          evt.preventDefault();
        });
        
        evt.preventDefault();
      });
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
    })
  }
});