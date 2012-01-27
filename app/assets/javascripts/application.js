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

jQuery.fn.exists = function() { return this.length > 0; }
$(document).ready(function() {
  $('#emoticon-list li').live('click', function() { emoticon_clicked($(this)); });
  $('#btn-add-to-favorites').live('click', function() { add_to_favorites(current_emoticon_id()); });
  setup_links();
  setup_forms();
  setup_new_emote_form();
  
  $('#search').keyup(function(event) {  if(event.keyCode == 13) { tag_search($(this).val()); } });
  $('#btn-search').click(function()  { tag_search($('#search').val()); });
  
  // Q? Wow, hackity hack.  Is there any way to bind this to the rails ajax:beforeSend so that
  // it handles accidently submissions of the default value?
  $('#add_tags').keyup(function(event) {  
    if(event.keyCode == 13) {
      if($(this).val() == 'Add a New Tag to this Emoticon') $(this).val('');
      $('.edit_emote').submit(); 
    } 
  });
  $('.btn-add-tag').click(function()  { 
    if($('#add_tags').val() == 'Add a New Tag to this Emoticon') $('#add_tags').val('');
    $('.edit_emote').submit();
    $('#add_tags').focus();
  });
  
  // ToDo: Abstract this out with the normal search function
  $('#search-tags li').live('click', function() {
    $(this).remove();
    // Build up a list of existing tags
    tags = [];
    $('#search-tags li').each(function() {
      tags.unshift( $(this).text() );
    });
    
    $.post('/emotes/search', { tags: tags }, function(data) {
      switch(data.status) {
        case 'valid_results':
        case 'no_results':
        case 'reset_results':
          $('#content').html(data.view);
        break;
        case 'invalid_tag':
          console.log("Tag doesn't exist!");
        break;
      }
    });
  });
  
  $("input").textReplacement({
      'activeClass': 'active',	//set :focus class
      'dataEnteredClass': 'data_entered', //set additional class for when data has been entered by the user
  });
  
  
  // ToDo: Clean this guy up
  // This is really dumb, but might be the only way to pull this off
  $('#sort-list li').live('click', function() {
    // ToDo: Function order is important here as change_sort needs to fire off
    // before animate_sort_list.  Probably worth updating change_sort so
    // it fires off animate_sort_list after its complete.
    change_sort($(this));
    animate_sort_list($(this));
    
  });
  
  // Checks to see if theres any notifications displayed and hides them after a sec
  if($('#notifications').exists()) {
    $('#notifications').delay(1750).slideUp();
  }
});

change_sort = function($selected) {
  if($selected.hasClass('active')) {
    return true;
  }
  
  selected_sort = $selected.text();
  current_display = $('#current-display').text();
  
  switch(current_display) {
    case 'all':
      $('#link-home').data('params', { sort: selected_sort });
      $('#link-home').click();
      break;
    case 'search':
      tag_search('', selected_sort);
      break;
  }
}

animate_sort_list = function($selected) {
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

/**
 * @description A function to handle the display and redisplay of tags on the site.
 * @param $tagContainer A jQuery DOM object that is the ul that will hold the tag list
 * @param tagList This can either be an array or a string.  If provided an array, then it will render the array as tags verbatim in the provided order.  If a string is passed, a duplication and empty check will be performed.  If the string passes both of those, then it will be appended to the tag list generated by parses through the $tagContainer.
 * @param Specifies whether you want the noLink css class applied to the tags.  Defaults to false.
 */
display_tags = function($tagContainer, tagList, noLink) {
  var tempArr = [];
  
  // Set default value on no link
  if(noLink == null) noLink = false;
  
  // Check if tagList was passed in a string and build an
  // array for it if it was.
  if(typeof(tagList) === 'string') {
    $tagContainer.find('a').each(function() {
      tempArr.push($(this).text());
    });
    
    // Run an empty and duplication check on the tag and add it to the array
    // if it passes.
    if($.trim(tagList) != '') {
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
tag_search = function(tag, sort) {
  if(sort == null) sort = "newest";
  
  $search = $('#search')
  $('#loading').show();
  
  // Build up a list of existing tags
  tags = [];
  $('#search-tags li').each(function() {
    tags.unshift( $(this).text() );
  });
  // Get the tag value from the search bar
  tags.unshift(tag);
  
  error = false;
  add_tag_to_tag_list = false;
  $.post('/emotes/search', { tags: tags, sort: sort }, function(data) {
    switch(data.status) {
      case 'valid_results':
      case 'no_results':
      case 'reset_results':
      case 'no_tag':
        $('#content').html(data.view);
        if(tag.length != 0) add_tag_to_tag_list = true;
      break;
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
    }
    if(add_tag_to_tag_list == true) {
      $('#search-tags').prepend('<li><a href="#">' + tag + '</a></li>');
    }
    $('#loading').hide();
    // Sometimes autocomplete doesnt disappear if you type in the whole word and hit
    // enter.  By hiding it, we garuntee that it goes away.
    $('.ui-autocomplete').hide();
    if(!error) {
      $search.val('');
    }
  });
  
  $search.val('');
}

setup_links = function() {
  default_remote_link($('#link-favorites'));
  default_remote_link($('#link-recent'));
  default_remote_link($('#link-home'));
  
  /* // Incase I ever need to bind on the autocomplete, this is how to do it [below]
  $('#add_tags').bind('railsAutocomplete.select', function(event, data) {
    console.log('Data:' + data.item.name);
  });
  */
}

setup_new_emote_form = function() {
  /***** New Emote Form Handler *****/
  var $newEmoteText = $('#new-emoticon-text');
  var newEmoteTextDefaultValue = $newEmoteText.val();
  var $newEmoteTagline =  $('#new-emoticon-tagline');
  var newEmoteTaglineDefaultValue = $newEmoteTagline.val();
  var $newEmoteAutoComplete = $('#new_emote_tags_input');
  var newEmoteAutoCompleteDefaultValue = $newEmoteAutoComplete.val();
  var $newEmoteTagList = $('#new-emote-tag-list');
  
  // A custom enter handler for this form due to the auto complete input field
  $('#new_emote').bind('keypress', function(event) {
    if(event.keyCode == 13 && event.srcElement.id == $newEmoteAutoComplete.attr('id')) {
      if($newEmoteAutoComplete.val() != newEmoteAutoCompleteDefaultValue && $newEmoteAutoComplete.val() != '') {
        console.log(event.keyCode);
        // Close out the auto complete form if it didnt go away by itself
        $('.ui-autocomplete').hide();
        new_emote_add_tag($newEmoteAutoComplete, $newEmoteTagList);
      }
      return false;
    } else {
      return true;
    }
  });
  // Handles the selection of a tag when Enter is pressed on the autocomplete list
  $newEmoteAutoComplete.autocomplete({
    select: function(event, ui) {
      new_emote_add_tag($newEmoteAutoComplete, $newEmoteTagList);
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
      return;
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

setup_forms = function() {
  $('.edit_emote')
    .bind('ajax:beforeSend', function(event, xhr, settings) { 
      $('.ui-autocomplete').hide();
      $('#add_tags').val('');
    })
    .bind('ajax:success', function(event, data, status, xhr) {
      var allTags, currentlyDisplayedTags, tagsToAdd;
      
      allTags = eval(data);
      currentlyDisplayedTags = [];
      tagsToAdd = [];
      $('#tag-list li').each(function() { currentlyDisplayedTags.push($(this).text()); });
      
      for(var i = 0; i < allTags.length; i++) {
        index = $.inArray(allTags[i], currentlyDisplayedTags);
        if(index == -1) tagsToAdd.push(allTags[i]);
      }
      
      for(var i = 0; i < tagsToAdd.length; i++) {
        $('#tag-list').append("<li><a>" + tagsToAdd[i] + "</a></li>");
      }
    });
}

default_remote_link = function($target) {
  var $l = $('#loading');
  $target.bind('ajax:beforeSend', function(event, xhr, settings) { $l.show(); })
         .bind('ajax:success',    function(event, data, status, xhr) 
            { $('#content').html(data); })
         .bind('ajax:complete',   function(event, xhr, status) { $l.hide(); })
         .bind('ajax:error',      function(event, xhr, status, error)
            { /* ToDo: Create an error message sometime here */ });
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
  refresh_tag_list(tag_list);
  update_recent_emotes(id);
  
  if($('#emoticon-display').is(':hidden')) {
    $('#emoticon-display').slideDown();
  }
}

new_emote_add_tag = function ($input, $tagList) {
  tag = $.trim($input.val().toLowerCase());
  $input.val('');
  
  $input.parent().children('span').hide();
  display_tags($tagList, tag);
  
}

refresh_tag_list = function(tag_list) {
  var $container;
  $container = $('#tag-list');
  $container.empty();
  $.each(tag_list, function(index, value) {
    $container.append('<li><a>' + value + '</a></li>');
  });
}

update_recent_emotes = function(id) {
  $.post('/emotes/record_recent', { id: id }, function() { console.log('recent-remote'); });
}

current_emoticon_id = function() {
  return $('#selected-id').val();
}

add_to_favorites = function(id) {
  $.post('/emotes/record_favorite', { id: id }, function() { console.log('favorite-emote'); });
  console.log('Favorite Emote ID:' + id);
}

clear_search_tags = function() {
  $('#search-tags li').remove();
}