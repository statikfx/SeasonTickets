$(function() {
  $(".month > h1").click(function() {
    $(this).toggleClass("hiding");
    $(this).parent().children(".series").toggleClass("hidden");
  });
  
  $(".series > h1").click(function() {
    $(this).toggleClass("hiding");
    $(this).parent().children(".game").toggleClass("hidden");
  });
  
  if (ADMIN) {
    $("a[href=#add-seat]").each(function() {
      $(this).click(function(evt) {
        var add_seat = $("#add-seat");
        add_seat.remove();
        add_seat[0].reset();
        
        $(this).parent().parent().append(add_seat);
        add_seat.removeClass("hidden");
        
        var gameId = $(this).parent().parent().attr("id");
        $("#add-seat-game-id").val(gameId);
        
        $("#add-seat-cancel").click(function(evt) {
          $("#add-seat").addClass("hidden");
          evt.preventDefault();
        });
        
        evt.preventDefault();
      });
    });
  }
});