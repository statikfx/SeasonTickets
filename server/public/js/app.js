$(function() {
  $(".month > h1").live("click", function() {
    // unhide and series
    $(this).parent().children(".series").children(".game").removeClass("hidden");
    $(this).parent().children(".series").children("h1").removeClass("hiding");
    
    $(this).toggleClass("hiding");
    $(this).parent().children(".series").toggleClass("hidden");
  });
  
  $(".series > h1").live("click", function() {
    $(this).toggleClass("hiding");
    $(this).parent().children(".game").toggleClass("hidden");
  });

/*  
  $(".series > ul").live("click", function() {
    var id = $(this).attr("id");
    window.location.href = "/game/" + id + "/";
  });
*/  
  $("#filterselect").live("click", function() {
    var addAdmin = "";
    if (window.location.pathname.indexOf("admin") != -1)
    {
      addAdmin = "admin/";
    }
    $.ajax({
        url: "/views/" + this.value + "/" + addAdmin,
        success: function(result) {
          $("#container").html(result);
        },
        error: function(result) {
          alert(result);
        }
      });
  });
  
  // is admin
  if ($("body").hasClass("admin")) {
    var reloadGameById = function(gameId)
    {
      if (gameId === "all" || gameId === "removeall")
      {
        $(".game").each(function() {
          var gameId = $(this).attr("id");
          $.ajax({
            url: "/admin/game/" + gameId,
            success: function(result) {
              $("#" + gameId).replaceWith(result);
            }
          });
        });
      } else {
        $.ajax({
          url: "/admin/game/" + gameId,
          success: function(result) {
            $("#" + gameId).replaceWith(result);
          }
        });
      }
    };
    
    $("a[href=#add-seat2]").live("click", function(evt) {
      var seat_editor = $("#seat-editor");
      //seat_editor.detach();
      //seat_editor[0].reset();
      
      $("#content").after(seat_editor);
      seat_editor.removeClass("hidden");
      
      var gameId = "all";
      seat_editor.data("gameId", gameId);
      
      evt.preventDefault();
    });
    
    // seat editor
    $("a[href=#add-seat]").live("click", function(evt) {
      var seat_editor = $("#seat-editor");
      seat_editor.detach();
      seat_editor[0].reset();
      
      $(this).parent().parent().after(seat_editor);
      seat_editor.removeClass("hidden");
      
      var gameId = $(this).parent().parent().attr("id");
      seat_editor.data("gameId", gameId);
      
      evt.preventDefault();
    });
    
    $("a[href=#removeallseats]").live("click", function(evt) {
      var that = $(this);
      
      var gameId = "removeall";
      var url = "/api/game/" + gameId + "/seat/";
      var type = "POST";
      var data = $(this).serialize();

      $.ajax({
        url: url,
        type: type,
        data: data,
        success: function() {
          reloadGameById(gameId);
        },
        error: function() {
          alert("Whoops. There was a problem adding the seat.");
        }
      });
      
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
      
      var gameId = $(this).data("gameId");
      var url = "/api/game/" + gameId + "/seat/";
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
          reloadGameById(gameId);
        },
        error: function() {
          reset();
          alert("Whoops. There was a problem adding the seat.");
        }
      });
      
      evt.preventDefault();
    });
    
    // hide all months/series before today
    var currentMonth = (new Date()).getMonth();
    var currentDate = (new Date()).getDate();
    $(".month > h1.hiding:last").each(function() {
      var month = $(this).parent().next();
      var shouldCollapseMonth = false;
      var allSeriesAreCollapsed = true;
      month.children(".series").each(function() {
        var allGamesBeforeToday = true;
        $(this).children(".game").each(function() {
          var date = parseInt($(this).children("li.date").text(), 10);
          if (date >= currentDate) {
            allGamesBeforeToday = false;
          }
        });
        if (allGamesBeforeToday) {
          $(this).children(".game").addClass("hidden");
          $(this).children("h1").addClass("hiding");
        } else {
          allSeriesAreCollapsed = false;
        }
      });
      shouldCollapseMonth = allSeriesAreCollapsed;
      
      if (shouldCollapseMonth) {
        month.children(".series").addClass("hidden");
        month.children("h1").addClass("hiding");
      }
    });
    
    // ajaxyify approval/rejection links
    $("a.approve").live("click", function(evt) {
      var gameEl = $(this).parent().parent();
      var gameId = gameEl.attr("id");
      
      var url = "/api/game/" + gameId + "/approve/";
      $.ajax({
        url: url,
        type: "POST",
        success: function() {
          reloadGameById(gameId);
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
          reloadGameById(gameId);
        },
        error: function() {
          alert("Whoops. There was a problem rejecting the game.");
        }
      });
      
      evt.preventDefault();
    });
  }
});
