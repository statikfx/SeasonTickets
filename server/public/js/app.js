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
  }
});