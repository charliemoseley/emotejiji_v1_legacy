// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require plugins
//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require autocomplete-rails
//= require_tree .

// Todo: No clue how to write my jQuery in CoffeeScript (though I do want to try to convert it over at some
// point.  Till then, pure JS below.


// Q? When porting over to coffeescript, I'd like to have it so javascript that doesnt need to render when
// a user is not logged in is not rendered… but that might be issue with caching? Not sure.

// Variables for jQuery objects used that we know are on the screen at page load
// First letters are capitilized to easy recognize them
var $TagCloud;

$(document).ready(function() {
  $TagCloud = $('#tag-cloud');
  
  $loading = $('#loading');
  $('#emoticon-list li').live('click', function() { emoticon_clicked($(this)); });
  $('#btn-add-to-favorites').live('click', function() {
    // Makes an assumption that user isnt mucking around with the JS and not 
    // attempting to save more then the max amount of favorites
    action = $(this).attr('data-action');
    $button = $(this);
    $data = $('#favorites-data');
    favoritesCount = parseInt($data.attr('data-favorites-count'));

    switch(action) {
      case 'add':
        add_to_favorites(current_emoticon_id(), 'add');
        
        $button.val('Remove Favorite');
        $button.attr('data-action', 'remove');
        $data.attr('data-favorites-count', favoritesCount + 1);
        $('#emote-' + current_emoticon_id() + ' article').attr('data-favorite', 'true');

        if($('#current-display').text() == 'favorites') $('#link-favorites').click();
        $(this).parent().children('img').show().delay(400).fadeOut('slow');
        break;
      case 'remove':
        add_to_favorites(current_emoticon_id(), 'remove');
        $data.attr('data-favorites-count', favoritesCount - 1);

        $button.val('Add to Favorites');
        $button.attr('data-action', 'add');
        $('#emote-' + current_emoticon_id() + ' article').attr('data-favorite', 'false');

        if($('#current-display').text() == 'favorites') $('#link-favorites').click();
        $(this).parent().children('img').show().delay(400).fadeOut('slow');
        break;
      case 'disabled':
        return false;
        break;
    }
  });
  setupRemoteLinks();
  setupEmoteTagAddForm();
  setupNewEmoteForm();
  setupSearchTag();
  
  // ToDo: Abstract this out with the normal search function
  $('#search-tags li').live('click', function() {
    $(this).remove();
    tagSearch('');
  });
  
  $("input").textReplacement({
      'activeClass': 'active',	//set :focus class
      'dataEnteredClass': 'data_entered', //set additional class for when data has been entered by the user
  });
  
  
  // ToDo: Clean this guy up
  $('#sort-list li').live('click', function() {
    if($(this).children('a').hasClass('no-link')) { return; }
    // ToDo: Function order is important here as change_sort needs to fire off
    // before animateSortList.  Probably worth updating change_sort so
    // it fires off animateSortList after its complete.
    change_sort($(this));
    animateSortList($(this));
    
  });
  
  // Checks to see if theres any notifications displayed and hides them after a sec
  if($('#notifications').exists()) {
    $('#notifications').delay(1750).slideUp();
  }
  
  
  $('#btn-toggle-tag-cloud').click(function() {
    if($TagCloud.is(':hidden')) {
      $(this).css('backgroundPositionY', '-16px');
    } else {
      $(this).css('backgroundPositionY', '0px');
    }
    
    offset = $('body').scrollTop();
    if($('#emoticon-display').is(':visible')) {
      offset -= (parseInt($('#emoticon-display').css('height').replace(/[^0-9]/g, '')) + 37);
    }
    $TagCloud.css('top', offset);
    $TagCloud.toggle();
  });
  
  $TagCloud.children('a').click(function() {
    tagSearch($(this).text());
    $TagCloud.hide();
    $('#btn-toggle-tag-cloud').css('backgroundPositionY', '0px');
  });
  
  // Update the text color of forms when they are clicked so it's easier to read
  $('input[type=text]')
    .focusin(function(event) { $(this).css('color', '#5C5C5C'); })
    .focusout(function(event) {
      if($(this).val() == '') {
        $(this).css('color', '#CCC');
      }
    });

    // ToDo: Getting lazy now
    $('#link-login').click(function (event) {
      event.preventDefault();
      if($('#login-options').exists()) {
        if($('#login-options').is(':visible')) {
          $('#login-options').slideUp(100);
        } else {
          $('#login-options').slideDown(100);
        }
      } else {
        document.location = $(this).attr('href');
      }
    });

    // ToDo: More laziness
    $('#logo').click(function(event) {
      event.preventDefault();
      var pathname = window.location.pathname;
      redirectPaths = ['/about', '/emotes/new', '/profile', '/login'];
      if($.inArray(pathname, redirectPaths) == -1) {
        $('#link-home').click();
      } else {
        window.location = "/";
      }
    });

    initialFavoritesSetup(initial_favorites_list);
});

/***************************************************************
 * Initial Setup and Binders
 ***************************************************************/
setupNewEmoteForm = function() {
  /***** New Emote Form Handler *****/
  var $newEmoteText = $('#new-emoticon-text');
  var newEmoteTextDefaultValue = $newEmoteText.val();
  var $newEmoteTagline =  $('#new-emoticon-tagline');
  var newEmoteTaglineDefaultValue = $newEmoteTagline.val();
  var $newEmoteAutoComplete = $('#new_emote_tags_input');
  var newEmoteAutoCompleteDefaultValue = $newEmoteAutoComplete.val();
  var $newEmoteTagList = $('#new-emote-tag-list');
  var $newEmoteSubmit = $('#new-emote-submit');
  
  // A custom enter handler for this form due to the auto complete input field
  $('#new_emote').bind('keypress', function(event) {
    // First check if enter has been hit
    if(event.keyCode == 13) {
      // If it has been, determine the form element where enter was hit
      // Current we're checking for the autocomplete tag field and that it's not blank
      if(event.srcElement.id == $newEmoteAutoComplete.attr('id') && $newEmoteAutoComplete.val() != '') {
        // Since we already know the input isnt empty, we check now if that value isnt the default one
        if($newEmoteAutoComplete.val() != newEmoteAutoCompleteDefaultValue) {
          newEmoteAddTag(sanitize($newEmoteAutoComplete.val()), $newEmoteTagList);
          $('.ui-autocomplete').hide();
        }
        return false;
      // If the input that enter was hit was submit, then process the form
      } else if(event.srcElement.id == $newEmoteSubmit.attr('id')) {
        // Q? I cant seem to use the submit function here because though
        // the alert box check triggers, the form still submits… maybe because
        // of submit() running some custom event that is cancelled out by the
        // one on $('#new_emote').bind(event, function() { event.preventDefault() } ?
        // A good stack overflow question.
        // $(this).submit();
        $newEmoteSubmit.click();
      // Otherwise progress to the next input
      } else {
        $('#'+event.srcElement.id).focusNextInputField();
        return false;
      }
    }
  });
  // Handles the selection of a tag when Enter is pressed on the autocomplete list
  $newEmoteAutoComplete
    .bind('autocompleteselect', function(event, ui) { 
      newEmoteAddTag(ui.item.value, $newEmoteTagList);
      $('#new_emote_tags_input').val('');
    })
    .bind('autocompleteclose', function(event, ui) {  
      // This is required because for some reason $('#new_emote_tags_input').val('')
      // doesnt seem to be working.
      var tempArr = [];
      $newEmoteTagList.find('a').each(function() {
        tempArr.push(sanitize($(this).text()));
      });
      if($.inArray($('#new_emote_tags_input').val(), tempArr) != -1) {
        $('#new_emote_tags_input').val('');
      }
    });
  
  // Run a series of validation checks on the form before submitting it.
  $('#new_emote').submit(function(event) {
    // This is to prevent jQuery from rampantly running this bind over and
    // over again while it's waiting for the form submit to happen
    if(event.isTrigger) return true;
    
    // Build a tag list into the autocomplete form right before submission.
    var tagListString = '';
    $newEmoteTagList.find('a').each(function() {
      var tempString = $(this).text();
      tagListString += tempString.replace(',', '') + ', ';
    });
    $newEmoteAutoComplete.val(tagListString);
    
    // Check if the default value or blank is still set and alert the user
    if($newEmoteText.val() == newEmoteTextDefaultValue || $newEmoteText.val() == '') {
      // ToDo: Uh… alert boxes are ghetto.  Please turn this into a real error xD.
      alert('You need to put a value into the emoticon text box.');
      event.preventDefault();
      return false;
    }
    
    // Check if the default value is set for the tagline and clear it out if it is
    if($newEmoteTagline.val() == newEmoteTaglineDefaultValue) {
      $newEmoteTagline.val('');
    }
    
    // Submit form
    $(this).submit();
  });
  
  // Remove tags if they are clicked.
  $($('#new-emote-tag-list li')).live('click', function() {
    $(this).remove();
  });
}

newEmoteAddTag = function (tag, $tagList) {
  if(isObjectType(tag, 'object')) tag = sanitize(tag.val());
  $('#new-emote-tag-help').hide();
  displayTags($('#new-emote-tag-list'), tag);
  $('#new_emote_tags_input').val('');
}

setupEmoteTagAddForm = function() {
  // Rails AJAX form binder
  $('.edit_emote')
    .bind('ajax:beforeSend', function(event, xhr, settings) {
      $('.ui-autocomplete').hide();
      if($('#add_tags').val() == 'Add a New Tag to this Emoticon') {
        $('#add_tags').focus();
        return false;
      }
    })
    .bind('ajax:success', function(event, data, status, xhr) {
      displayTags($('#tag-list'), eval(data), true);
      
      $('#add_tags').val('').focus();
      $('.ui-autocomplete').hide();
    });
  
  $('#add_tags').bind('autocompleteselect', function(event, ui) {
    $(this).val(ui.item.value);
    $('.edit_emote').submit();
  });
  
  // Handles the button press
  $('.btn-add-tag').click(function()  { $('.edit_emote').submit(); });
}

setupSearchTag = function() {
  // Search Field
  $('#search')
    .bind('keypress', function(event) {  if(event.keyCode == 13) { tagSearch($(this).val()); } })
    .bind('autocompleteselect', function(event, ui) { tagSearch(ui.item.value); });
  $('#btn-search').click(function()  { tagSearch($('#search').val()); });
}

setupRemoteLinks = function() {
  defaultRemoteLink($('#link-favorites'));
  defaultRemoteLink($('#link-recent'));
  defaultRemoteLink($('#link-home'));
  defaultRemoteLink($('#link-profile'));
  defaultRemoteLink($('#link-tag-list'), function(data) { $('#content').html(data); initialFavoritesSetup(initial_favorites_list); });
}

defaultRemoteLink = function($target, customCallback) {
  $target.bind('ajax:beforeSend', function(event, xhr, settings) { $loading.show(); })
         .bind('ajax:success',    function(event, data, status, xhr) { 
            if(customCallback == null) {
              clearTagList($('#search-tags')); $('#content').html(data);
              initialFavoritesSetup(initial_favorites_list);
            } else {
              customCallback(data)
            }
          })
         .bind('ajax:complete',   function(event, xhr, status) { $loading.hide(); })
         .bind('ajax:error',      function(event, xhr, status, error)
            { /* ToDo: Create an error message sometime here */ });
}
 
/***************************************************************
 * Tag Related Functions
 ***************************************************************/

/**
 * @description A function to handle the display and redisplay of tags on the site.
 * @param $tagContainer A jQuery DOM object that is the ul that will hold the tag list
 * @param tagList This can either be an array or a string.  If provided an array, then it will render the array as tags verbatim in the provided order.  If a string is passed, a duplication and empty check will be performed.  If the string passes both of those, then it will be appended to the tag list generated by parses through the $tagContainer.
 * @param Specifies whether you want the noLink css class applied to the tags.  Defaults to false.
 */
displayTags = function($tagContainer, tagList, noLink) {
  var tempArr = [];
  
  // Set default value on no link
  if(noLink == null) noLink = false;
  
  // Check if tagList was passed in a string and build an
  // array for it if it was.
  if(isObjectType(tagList, 'string')) {
    $tagContainer.find('a').each(function() {
      tempArr.push($(this).text());
    });
    
    // Run an empty and duplication check on the tag and add it to the array
    // if it passes.
    if(sanitize(tagList) != '') {
      if($.inArray(tagList, tempArr) == -1) tempArr.push(tagList);
    }
    tagList = tempArr;
  }
  $tagContainer.empty();
  $.each(tagList, function(index, value) {
    if(noLink) { 
      $tagContainer.append('<li><a class="no-link">' + value + '</a></li>');
    } else {
      $tagContainer.append('<li><a>' + value + '</a></li>');
    }
  });
}

// ToDo: Clean up this and really tighten up the selectors (heck, abstract it out better too)
tagSearch = function(tag, sort) {
  if(sort == null) sort = currentSort();
  var tagList;
  
  tag = sanitize(tag);
  // Build up the tag list and see if we even search
  tagList = buildTagList($('#search-tags'));
  if(isDuplicateTag(tag, tagList)) return false;
  //if(tag == '' && tagList.length == 0) return false;
  
  $loading.show();
  $search = $('#search');
  
  error = false;
  $.post('/emotes/search', { tag: tag, tag_list: tagList, sort: sort }, function(data) {
    switch(data.status) {
      case 'invalid_tag':
        $search.attr('disabled', 'disabled');
        $search.attr('style', 'background-color: red; color: #FFFFFF;');
        $search.val("Sorry, that tag doesn't exist.");
        $search.animate({ backgroundColor: '#FFFFFF' }, 1500, 'easeInCubic', function() {
          $search.val('');
          $search.removeAttr('disabled');
          $search.removeAttr('style');
        });
        error = true;
      break;
      case 'valid_results':
      case 'no_results':
      case 'reset_results':
        tagList.push(tag);
        $('#content').html(data.view);
        initialFavoritesSetup(initial_favorites_list);
        updateTagCloud(eval(data.tag_descendants));
        if(tag.length != 0) displayTags($('#search-tags'), tagList);
      break;
    }
    $loading.hide();
    // Sometimes autocomplete doesnt disappear if you type in the whole word and hit
    // enter.  By hiding it, we garuntee that it goes away.
    $('.ui-autocomplete').hide();
    if(!error) {
      $search.val('');
    }
  });
  
  $search.val('');
}

/**
 *  @description A simple function to build a taglist from a jQuery object
 */
buildTagList = function($tagContainer) {
  var tagList = [];
  
  $tagContainer.find('a').each(function() {
    tagList.push($(this).text());
  });
  return tagList;
}

/**
 *  @description A simple function that determines whether a given tag is in a tag list
 */
isDuplicateTag = function(tag, tagList) {
  if(!isObjectType(tagList, 'array')) tagList = buildTagList(tagList);
  if( $.inArray(tag, tagList) == -1 ) return false;
  return true;
}

clearTagList = function($tagContainer) { $tagContainer.empty(); $TagCloud.children('a').addClass('active'); }

updateTagCloud = function(valid_tags) {
  $tags = $TagCloud.children('a');
  $tags.addClass('active');
  $tags.each(function() {
    if($.inArray($(this).text(), valid_tags) == -1) {
      $(this).removeClass('active');
    }
  });
  
  if($tags.filter('.active').size() == 0) {
    $TagCloud.children('p').show();
  } else {
    $TagCloud.children('p').hide();
  }
}

/***************************************************************
 * Other Functions
 ***************************************************************/
change_sort = function($selected) {
  if($selected.hasClass('active')) {
    return true;
  }
  
  $loading.show();
  selected_sort = $selected.text();
  current_display = $('#current-display').text();
  
  switch(current_display) {
    case 'all':
      $('#link-home').data('params', { sort: selected_sort });
      $('#link-home').click();
      break;
    case 'search':
      tagSearch('', selected_sort);
      break;
  }
}
 
emoticon_clicked = function($container) {
  var emoticon, note, id, $form;
  $form = $('#emoticon-display form');
  
  id = $container.attr('id').substring(6);
  emoticon = $container.children('article').text();
  note = $container.children('aside').text();
  tag_list = eval($container.children('input').val());
  is_favorite = $container.children('article').attr('data-favorite');
  numberOfFavorites = parseInt($('#favorites-data').attr('data-favorites-count'));
  limitOfFavorites  = parseInt($('#favorites-data').attr('data-favorites-limit'));
  
  // Q? This is tightly bound to the model, any way we can better abstract this?
  $form.attr('action', '/emotes/' + id);
  $form.attr('id', 'edit_emote_' + id);
  $('#selected-id').val(id);
  $('#selected-emoticon').text(emoticon);
  $('#selected-note').text(note);
  displayTags($('#tag-list'), tag_list, true);
  update_recent_emotes(id);

  $favoritesButton = $('#btn-add-to-favorites');
  $favoritesButton.removeAttr('disabled');
  $favoritesButton.removeClass('disabled');
  if(is_favorite == 'true') {
    $favoritesButton.val('Remove Favorite');
    $favoritesButton.attr('data-action', 'remove');
  } else {
    if(numberOfFavorites < limitOfFavorites) {
      $favoritesButton.val('Add to Favorites');
      $favoritesButton.attr('data-action', 'add');
    } else {
      $favoritesButton.val('Max Favorites Reached');
      $favoritesButton.attr('data-action', 'disable');
      $favoritesButton.attr('disabled', 'disabled');
      $favoritesButton.addClass('disabled');
    }
  }
  
  if($('#emoticon-display').is(':hidden')) {
    $('body').animate({ paddingTop: 320 }, 500, 'swing');
    $('#emoticon-display').slideDown(500, 'swing', function() { refreshZeroClipboard(); });
  } else {
    refreshZeroClipboard();
  }
}

refreshZeroClipboard = function() {
  // Remove the existing zero clipboards
  $('.zclip').remove();
  
  // Create a new one
  $('#btn-copy-to-clipboard').zclip({
    path: 'ZeroClipboard.swf',
    copy: function() { return $.trim($('#selected-emoticon').text()); },
    afterCopy: function() {
      $(this).parent().children('img').show().delay(400).fadeOut('slow');
    }
  });
  
  // Due to the position on my buttons, the jQuery plugin doesnt
  // seem to handle the positioning correctly, so lets manually
  // fix it
  $container = $('.zclip');
  leftOffset = parseInt($container.css('left').replace(/[^0-9]/g, '')) - 155;
  topOffset = parseInt($container.css('top').replace(/[^0-9]/g, '')) - 6;
  $container.css('left', leftOffset);
  $container.css('top', topOffset);
  $container.css('zIndex', 11);
  
  // The top and left dont seem to kick in unless you somehow
  // update the state of the container.
  $parent = $container.parent();
  $parent.append($container.detach());
}

update_recent_emotes = function(id) {
  $.post('/emotes/record_recent', { id: id });
}

current_emoticon_id = function() {
  return $('#selected-id').val();
}

add_to_favorites = function(id, action) {
  $.post('/emotes/record_favorite', { id: id, actionToDo: action}, function(data) {
    
  });
}

initialFavoritesSetup = function(favorites) {
  if(favorites.length > 0) {
    $.each(favorites, function(index, value) {
      $('#emote-' + value).children('article').attr('data-favorite', 'true'); 
    });
  }
}

sanitize = function(string) { return $.trim(string.toLowerCase()); }
currentSort = function() { return $('#sort-list .active').text(); }
isObjectType = function(variable, type) {
  // Handle the shortcut words
  switch (type) {
    case 'array':
      type = '[object Array]';
      break;
    case 'number':
    case 'integer':
      type = '[object Number]';
      break;
    case 'string':
      type = '[object String]';
      break;
    case 'object':
      type = '[object Object]';
      break;
  }
  
  if(Object.prototype.toString.call(variable) === type) return true;
  return false;
}

/***************************************************************
 * Animation
 ***************************************************************/
animateSortList = function($selected) {
  $container = $('#sort-list');
  $list      = $('#sort-list li');
  $active    = $('#sort-list li.active');
  $inactive1 = $('#sort-list li.inactive:first');
  $inactive2 = $('#sort-list li.inactive:last');
  
  check_value = parseInt($inactive1.css('right'));
  // Check to see if the element has been position
  if(isNaN(check_value) || (check_value < 0)) {
    // Prep the off screen locations of two inactive li
    $inactive1.css('right', -$inactive1.outerWidth());
    $inactive2.css('right', -$inactive1.outerWidth() + -$inactive2.outerWidth());
    
    // This allows both to move linear while keeping the appearance that they are together
    $inactive1.animate({'right': $active.outerWidth() + $inactive2.outerWidth()}, 200, 'linear');
    $inactive2.animate({'right': $active.outerWidth()}, 200, 'linear');
  } else {
    // Check first if the newly selected active li is not the same as the old one
    if($selected.hasClass('active')) {
      $inactive1.animate({'right': -$inactive1.outerWidth()}, 200, 'linear', function() { $(this).removeAttr('style'); });
      $inactive2.animate({'right': -$inactive1.outerWidth() + -$inactive2.outerWidth()}, 200, 'linear', function() { $selected.removeAttr('style'); })
    } else {
      // Reassign the classes and temporarily absolutely position the active class
      $right = $active.css('right', 0).removeClass().addClass('inactive');
      $active = $selected.css('position', 'absolute').removeClass().addClass('active');
      
      // Determine which inactive li was not convereted to the active class
      if(parseInt($active.css('right')) == parseInt($inactive1.css('right'))) {
        $unknown = $inactive2;
      } else {
        $unknown = $inactive1;
      }
      
      // Figure out the left and middle position lis in addition to determine
      // the position of the active li
      is_middle_active = true;
      if(parseInt($active.css('right')) > parseInt($unknown.css('right'))) {
        $left = $active;
        $middle = $unknown;
        is_middle_active = false;
      } else {
        $left = $unknown;
        $middle = $active;
      }
      
      // To give the illusion that the element on the far right is sliding
      // undeneath is own padding, we temporarily create an absolutely positioned
      // div to cover the text
      $container.append('<li style="position: absolute; right: 0;"></li>');
      $cover = $container.children().last();
      $cover.css('width', $right.css('padding')).css('height', $right.css('height')).css('background-color', $active.css('background-color')).css('z-index',  parseInt($unknown.css('z-index')) + 1);
      
      // To garuantee that the middle li gracefully slides over the cover, we
      // increase it's z-index (assuming it's the active li)
      if(is_middle_active) {
        $middle.css('z-index', parseInt($cover.css('z-index')) + 1);
      }
      
      // Animate everything to the 0 position knowning the active class will
      // float to the top.  Have the right most li animate off the screen (since
      // we know it can never be the active li).
      $left.animate({'right': 0}, 200, 'linear', function() { $list.removeAttr('style'); });
      // If the middle is not the active li, it needs to slide off the screen.
      $middle.animate({'right': 0}, 100, 'linear', function() {
        if(!is_middle_active) {
          // The additioinal remoteAttr on this guy is because you not garuanteed that the $left.animate will finish last
          // so you need to clear it again to make sure the styles are removed on all the lis
          $middle.animate({'right': -$middle.outerWidth()}, 100, 'linear', function() { $cover.remove(); $list.removeAttr('style');  });
        }
      });
      $right.animate({'right': -$right.outerWidth()}, 100, 'linear', function() { if(is_middle_active) { $cover.remove(); } })
    }
  }
}