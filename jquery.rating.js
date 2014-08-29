//
// rating Plugin
// By Chris Richards
//
// Turns a select box into a star rating control.
//

//Keeps '$' pointing to the jQuery version
(function ($) {

  $.fn.rating = function(options) {
    //
    // Settings
    //
    var settings =
    {
      showCancel: true,
      cancelValue: null,
      disabled: false
    };
    $.extend(settings, options);

    //
    // Events API
    //
    var events =
    {
      hoverOver: function(evt) {
        var elm = $(evt.target);

        //Are we over the Cancel or the star?
        if (elm.hasClass("ui-rating-cancel")) {
          elm.addClass("ui-rating-cancel-full");
        }
        else {
          elm.prevAll().addBack()
              .not(".ui-rating-cancel")
              .addClass("ui-rating-hover");
        }
      },
      hoverOut: function(evt) {
        var elm = $(evt.target);
        //Are we over the Cancel or the star?
        if (elm.hasClass("ui-rating-cancel")) {
          elm.addClass("ui-rating-cancel-empty")
              .removeClass("ui-rating-cancel-full");
        }
        else {
          elm.prevAll().addBack()
              .not(".ui-rating-cancel")
              .removeClass("ui-rating-hover");
        }
      },
      click: function(evt) {
        var elm = $(evt.target);
        var value = settings.cancelValue;
        //Are we over the Cancel or the star?
        if (elm.hasClass("ui-rating-cancel")) {
          //Clear all of the stars
          events.empty(elm);
        }
        else {
          //Set us, and the stars before us as full
          elm.closest(".ui-rating-star").prevAll().addBack()
              .not(".ui-rating-cancel")
              .prop("class", "ui-rating-star ui-rating-full");
          //Set the stars after us as empty
          elm.closest(".ui-rating-star").nextAll()
              .not(".ui-rating-cancel")
              .prop("class", "ui-rating-star ui-rating-empty");
          //Uncheck the cancel
          elm.siblings(".ui-rating-cancel")
              .prop("class", "ui-rating-cancel ui-rating-cancel-empty");
          //Use our value
          value = elm.prop("value");
        }

        //Set the select box to the new value
        if (!evt.data.hasChanged) {
          $(evt.data.selectBox).val(value).trigger("change");
        }
      },
      change: function(evt) {
        var value = $(this).val();
        events.setValue(value, evt.data.container, evt.data.selectBox);
      },
      setValue: function(value, container, selectBox) {
        //Set a new target and let the method know the select has already changed.
        var evt = {"target": null, "data": {}};
        evt.target = $(".ui-rating-star[value=" + value + "]", container);
        evt.data.selectBox = selectBox;
        evt.data.hasChanged = true;
        events.click(evt);
      },
      empty: function(elm) {
        //Clear all of the stars
        elm.prop("class", "ui-rating-cancel ui-rating-cancel-empty")
            .siblings().prop("class", "ui-rating-star ui-rating-empty");
      }
    };

    //
    // HTML API
    //
    var HTML =
    {
      // Creates the holding container for the rating control
      createContainer: function(elm) {
        var div = $("<div/>").prop({
          "title": elm.title,
          "class": "ui-rating"
        }).insertAfter(elm);
        return div;
      },
      // Creates a Star
      createStar: function(elm, div) {
        $("<a/>").prop({
          "class": "ui-rating-star ui-rating-empty",
          "title": $(elm).text(),
          "value": elm.value
        }).appendTo(div);
      },
      // Create the Cancel Button
      createCancel: function(elm, div) {
        $("<a/>").prop({
          "class": "ui-rating-cancel ui-rating-cancel-empty",
          "title": "Cancel"
        }).appendTo(div);
      }
    };

    //
    // Process the matched elements
    //
    return this.each(function() {
      //We only do select types
      if ($(this).prop("type") !== "select-one") {
        return;
      }
      //Save 'this' for ease of development
      var selectBox = this;
      //Hide the selectBox
      $(selectBox).css("display", "none");
      //Does it have an ID? if not generate one
      var id = $(selectBox).prop("id");
      if ("" === id) {
        id = "ui-rating-" + $.data(selectBox);
        $(selectBox).prop("id", id);
      }

      //Create the holding container
      var div = HTML.createContainer(selectBox);

      //Should we do any binding?
      if (true !== settings.disabled && $(selectBox).prop("disabled") !== true) {
        //Bind our events to the container
        $(div).on("mouseover", events.hoverOver)
            .on("mouseout", events.hoverOut)
            .on("click", {"selectBox": selectBox}, events.click);
      }

      //Now loop over every option in the select box.
      $("option", selectBox).each(function() {
        //Create a Star
        if ($(this).prop('value') !== '') {
          HTML.createStar(this, div);
        }
      });

      //Should we create the Cancel button?
      if (settings.showCancel) {
        HTML.createCancel(this, div);
      }

      //Is there an element with the select option set?
      if (0 !== $("#" + id + " option:selected").length) {
        //Set the Starting Value
        $(div).find(".ui-rating-star[value=" + $(selectBox).val() + "]").click();
      }
      //Update the stars if the selectbox value changes.

      $(this).on("change", {"selectBox": selectBox, "container": div}, events.change);
    });

  };

})(jQuery);
