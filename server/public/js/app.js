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

  $(':input[type="text"]', '#priceform').live("click", function() {
    $(this).removeClass("fieldError");
  });

  $(':input[type="reset"]', '#priceform').live("click", function() {
    $(':input[type="text"]', '#priceform').each(function() {
      $(this).removeClass("fieldError");
    });
  });
  
  $("#requestform").live("submit", function(evt) {
    var that = $(this);
  
    var url = "/requests/add/" + $('#gameid').val();
    var type = $(this).attr("method");
    var data = $(this).serialize();
  
    var submit = $("#requestform input[type=submit]");
    var previousTitle = submit.val();
    submit.attr("disabled", true);
    submit.val("Working...");
  
    $.ajax({
  	  url: url,
	  type: type,
	  data: data,
	  success: function() {
	    alert('done!');
	  },
	  error: function() {
	    alert("Whoops. There was a problem adding the request.");
	 }
    });
  
    evt.preventDefault();
  });

  // is admin
  if ($("body").hasClass("admin")) {
    var reloadGameById = function(gameId)
    {
      $.ajax({
        url: "/admin/game/" + gameId,
        success: function(result) {
          $("#" + gameId).replaceWith(result);
        }
      });
    };
    
    var reloadGameList = function()
    {
      $.ajax({
        url: "/admin/refresh/games/all/",
        success: function(result) {
          $("#games").html(result);
        }
      });
    }
    
    var reloadPricingTiers = function()
    {
      $.ajax({
        url: "/admin/pricing/plist/",
        success: function(result) {
          $("#pricinglist").replaceWith(result);
        }
      });
    }
    
    $("#priceform").live("submit", function(evt) {
      var that = $(this);
      
      var url = "/api/pricing/add/";
      var type = $(this).attr("method");
      var data = $(this).serialize();

      var validateFormFields = function () {
        var fieldsValidated = true;
        $(':input[type="text"]', '#priceform').each(function() {
          var fieldName = this.name;
          var fieldValue = this.value;
            
          if (fieldValue.length == 0)
          {
        	$(':input[name="' + fieldName + '"]', "#priceform").addClass("fieldError");
            fieldsValidated = false;
          }
        });
        return fieldsValidated;
      }
	  
      if (!validateFormFields())
      {
      	evt.preventDefault();
        return;
      }
      
      var submit = $("#priceform input[type=submit]");
      var previousTitle = submit.val();
      submit.attr("disabled", true);
      submit.val("Working...");
      
      var resetPriceForm = function() {
        submit.attr("disabled", false);
        submit.val(previousTitle);
        $(':input','#priceform').not(':button, :submit, :reset, :hidden').val('').removeAttr('checked').removeAttr('selected');
      };
      
      $.ajax({
        url: url,
        type: type,
        data: data,
        success: function() {
          resetPriceForm();
          reloadPricingTiers();
          reloadGameList();
        },
        error: function() {
          resetPriceForm();
          alert("Whoops. There was a problem adding the tier.");
        }
      });
      
      evt.preventDefault();
    });
    
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
          reloadGameList();
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
          if (gameId === "all")
            reloadGameList();
          else
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

    $("a.setprice").live("click", function(evt) {
      var gameEl = $(this).parent().parent();
      var gameId = gameEl.attr("id");
      
      var url = $(this).attr("href");
      $.ajax({
        url: url,
        type: "POST",
        success: function() {
          reloadGameById(gameId);
        },
        error: function() {
          alert("Whoops. There was a problem setting the price for this game.");
        }
      });
      
      evt.preventDefault();
    });

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

    $("a.viewapprove").live("click", function(evt) {
      var gameId = $(".gameid").text();
      
      var url = "/api/game/" + gameId + "/approve/";
      $.ajax({
        url: url,
        type: "POST",
        success: function() {
          $(".status").text("approved");
        },
        error: function() {
          alert("Whoops. There was a problem approving the game.");
        }
      });
      
      evt.preventDefault();
    });

    $("#showhide").live("click", function(evt) {
      $("#pbody").toggle();
      
      $("#showhide").val($("#pbody").is(":visible") ? "-" : "+");
    
      evt.preventDefault();
    });

    $("a.viewreject").live("click", function(evt) {
      var gameId = $(".gameid").text();
      
      var url = "/api/game/" + gameId + "/reject/";
      $.ajax({
        url: url,
        type: "POST",
        success: function() {
          $(".status").text("rejected");
        },
        error: function() {
          alert("Whoops. There was a problem rejecting the game.");
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

    $("a#deltier").live("click", function(evt) {
      var tierURL = $(this).attr("href");
      var url = tierURL;
      $.ajax({
        url: url,
        type: "GET",
        success: function() {
          reloadPricingTiers();
          reloadGameList();
        },
        error: function() {
          alert("Whoops. There was a problem deleting the price tier.");
        }
      });
      
      evt.preventDefault();
    });
  }
  
  function windowSize() {
    return {width: $(window).width(), height: $(window).height()};
  }
  
  var modalBox = {
    init: function(element, width, height) {
      var body = $('body');
      
      var overlay = $('<div></div>');
      overlay.addClass('overlay');
      
      var modal = $('<div><div class="close">close</div></div>');
      modal.addClass('modal');
      
      var wSize = windowSize();
      
      modal.width(width);
      modal.height(height);
      modal.offset({left: (wSize.width - width) / 2.0, top: (wSize.height - height) / 2.0});
      
      element.clone().appendTo(modal);
      modal.appendTo(body);
      overlay.appendTo(body);
    },    
    show: function(element, width, height) {
      modalBox.init(element, width, height);
    
      $('.overlay').live('click', function() {
        modalBox.close();
      });
      
      $('.modal .close').live('click', function() {
        modalBox.close();
      });
    
      $(window).bind('resize', function () {
         var modal = $(".modal");
         var overlay = $(".overlay");
         
         if (modal && overlay) {
           var wSize = windowSize();
           
           var xOffset = (wSize.width - width) / 2.0;
           var yOffset = (wSize.height - height) / 2.0;
           
           if (xOffset < 0) xOffset = 0;
           if (yOffset < 0) yOffset = 0;
           
           modal.offset({left: xOffset, top: yOffset});
         }
      });
    },
    close: function() {
      var modal = $(".modal");
      var overlay = $(".overlay");

      if (modal) modal.remove();
      if (overlay) overlay.remove();
      
      $(window).unbind('resize');
    }
  }

});
