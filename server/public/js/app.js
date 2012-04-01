$(function () {
  $(".month > h1").live("click", function () {
    // unhide and series
    $(this).parent().children(".series").children(".game").removeClass("hidden");
    $(this).parent().children(".series").children("h1").removeClass("hiding");

    $(this).toggleClass("hiding");
    $(this).parent().children(".series").toggleClass("hidden");
  });

  $(".series > h1").live("click", function () {
    $(this).toggleClass("hiding");
    $(this).parent().children(".game").toggleClass("hidden");
  });

  $(':input[type="text"]', '#priceform').live("click", function () {
    $(this).removeClass("fieldError");
  });

  $(':input[type="reset"]', '#priceform').live("click", function () {
    $(':input[type="text"]', '#priceform').each(function () {
      $(this).removeClass("fieldError");
    });
  });

  $("#requestform").live("submit", function (evt) {
    var that = $(this);

    var url = "/cubs/requests/add/" + $('#gameid').val();
    var type = $(this).attr("method");
    var data = $(this).serialize();

    var submit = $("#requestform input[type=submit]");
    var previousTitle = submit.val();
    //submit.attr("disabled", true);
    //submit.val("Working...");
    $.ajax({
      url: url,
      type: type,
      data: data,
      success: function () {
        reloadRequestList($('#gameid').val());
        $(':input[type="text"]', '#requestform').each(function () {
          $(this).val('');
        });
      },
      error: function () {
        alert("Whoops. There was a problem adding the request.");
      }
    });

    evt.preventDefault();
  });

  var reloadRequestList = function (id) {
      $.ajax({
        url: "/cubs/requests/get/" + id + "/",
        success: function (result) {
          $("#requests").replaceWith(result);
        }
      });
    }

    // is admin
  function windowSize() {
    return {
      width: $(window).width(),
      height: $(window).height()
    };
  }

  var modalBox = {
    init: function (element, width, height) {
      var body = $('body');

      var overlay = $('<div></div>');
      overlay.addClass('overlay');

      var modal = $('<div><div class="close">close</div></div>');
      modal.addClass('modal');

      var wSize = windowSize();

      modal.width(width);
      modal.height(height);
      modal.offset({
        left: (wSize.width - width) / 2.0,
        top: (wSize.height - height) / 2.0
      });

      element.clone().appendTo(modal);
      modal.appendTo(body);
      overlay.appendTo(body);
    },
    show: function (element, width, height) {
      modalBox.init(element, width, height);

      $('.overlay').live('click', function () {
        modalBox.close();
      });

      $('.modal .close').live('click', function () {
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

          modal.offset({
            left: xOffset,
            top: yOffset
          });
        }
      });
    },
    close: function () {
      var modal = $(".modal");
      var overlay = $(".overlay");

      if (modal) modal.remove();
      if (overlay) overlay.remove();

      $(window).unbind('resize');
    }
  }

});