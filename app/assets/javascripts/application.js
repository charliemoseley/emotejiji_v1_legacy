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
$(document).ready(function() {
  $loading = $('#loading');
  $('#emoticon-list li').live('click', function() { emoticon_clicked($(this)); });
  $('#btn-add-to-favorites').live('click', function() { add_to_favorites(current_emoticon_id()); });
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
        console.log(1);
        // Since we already know the input isnt empty, we check now if that value isnt the default one
        if($newEmoteAutoComplete.val() != newEmoteAutoCompleteDefaultValue) {
          newEmoteAddTag(sanitize($newEmoteAutoComplete.val()), $newEmoteTagList);
        }
        console.log(3);
        return false;
      // If the input that enter was hit was submit, then process the form
      } else if(event.srcElement.id == $newEmoteSubmit.attr('id')) {
        console.log(3);
        // Q? I cant seem to use the submit function here because though
        // the alert box check triggers, the form still submits… maybe because
        // of submit() running some custom event that is cancelled out by the
        // one on $('#new_emote').bind(event, function() { event.preventDefault() } ?
        // A good stack overflow question.
        // $(this).submit();
        $newEmoteSubmit.click();
      // Otherwise progress to the next input
      } else {
        console.log(5);
        $('#'+event.srcElement.id).focusNextInputField();
        return false;
      }
    }
  });
  // Handles the selection of a tag when Enter is pressed on the autocomplete list
  $newEmoteAutoComplete
    .bind('autocompleteselect', function(event, ui) { newEmoteAddTag(ui.item.value, $newEmoteTagList); })
    .bind('autocompleteclose', function(event, ui) { $('#new_emote_tags_input').val(''); });
  
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
  $('#new_emote_tags_input').val('');
  displayTags($('#new-emote-tag-list'), tag);
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
}

defaultRemoteLink = function($target) {
  $target.bind('ajax:beforeSend', function(event, xhr, settings) { $loading.show(); })
         .bind('ajax:success',    function(event, data, status, xhr) 
            { clearTagList($('#search-tags')); $('#content').html(data); })
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

clearTagList = function($tagContainer) { $tagContainer.empty(); }

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
  
  // Q? This is tightly bound to the model, any way we can better abstract this?
  $form.attr('action', '/emotes/' + id);
  $form.attr('id', 'edit_emote_' + id);
  $('#selected-id').val(id);
  $('#selected-emoticon').text(emoticon);
  $('#selected-note').text(note);
  displayTags($('#tag-list'), tag_list, true);
  update_recent_emotes(id);
  
  if($('#emoticon-display').is(':hidden')) {
    $('#emoticon-display').slideDown(function() { refreshZeroClipboard(); });
  } else {
    refreshZeroClipboard();
  }
}

refreshZeroClipboard = function() {
  $('#btn-copy-to-clipboard').zclip({
    path: 'ZeroClipboard.swf',
    copy: function() { return $('#selected-emoticon').text() },
    afterCopy: function() { return; }
  });
}



update_recent_emotes = function(id) {
  $.post('/emotes/record_recent', { id: id });
}

current_emoticon_id = function() {
  return $('#selected-id').val();
}

add_to_favorites = function(id) {
  $.post('/emotes/record_favorite', { id: id });
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