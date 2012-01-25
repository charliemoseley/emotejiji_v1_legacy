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
  $('#emoticon-list li').live('click', function() { emoticon_clicked($(this)); });
  $('#btn-add-to-favorites').live('click', function() { add_to_favorites(current_emoticon_id()); });
  setup_links();
  
  $('#search').keyup(function(event) { tag_search(event.which, $(this)); });
  $('#btn-search').click(function()  { tag_search(13, $('#search')); });
  
  // ToDo: Abstract this out with the normal search function
  $('#search-tags li').live('click', function() {
    console.log("I ran");
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
    console.log('clicked');
    $list      = $('#sort-list li');
    $active    = $('#sort-list li.active');
    $inactive1 = $('#sort-list li.inactive:first');
    $inactive2 = $('#sort-list li.inactive:last');
      
    console.log("value: " + $inactive1.css('right'));
    console.log("value: " + parseInt($inactive1.css('right')));
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
      if($(this).hasClass('active')) {
        $inactive1.animate({'right': -$inactive1.outerWidth()}, 200, 'linear', function() { $(this).removeAttr('style'); });
        $inactive2.animate({'right': -$inactive1.outerWidth() + -$inactive2.outerWidth()}, 200, 'linear', function() { $(this).removeAttr('style'); })
      } else {
        // Reassign the classes and temporarily absolutely position the active class
        $right = $active.css('right', 0).removeClass().addClass('inactive');
        $active = $(this).css('position', 'absolute').removeClass().addClass('active');
        
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
        $('#sort-list').append('<li style="position: absolute; right: 0;"></li>');
        $cover = $('#sort-list li').last();
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
  });
});

  // ToDo: Clean up this and really tighten up the selectors
tag_search = function(key_press, $search) {
  if(key_press == 13) { // Enter Key
    $('#loading').show();
    
    // Build up a list of existing tags
    tags = [];
    $('#search-tags li').each(function() {
      tags.unshift( $(this).text() );
    });
    // Get the tag value from the search bar
    searchTag = $search.val();
    tags.unshift(searchTag);
    
    error = false;
    add_tag_to_tag_list = false;
    $.post('/emotes/search', { tags: tags }, function(data) {
      switch(data.status) {
        case 'valid_results':
        case 'no_results':
        case 'reset_results':
          $('#content').html(data.view);
          add_tag_to_tag_list = true;
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
        $('#search-tags').prepend('<li><a href="#">' + searchTag + '</a></li>');
      }
      $('#loading').hide();
      // Sometimes autocomplete doesnt disappear if you type in the whole word and hit
      // enter.  By hiding it, we garuntee that it goes away.
      $('.ui-autocomplete').hide();
      if(!error) {
        $('#search').val('');
      }
    });
    
    $search.val('');
  }
}

setup_links = function() {
  // ToDo: Clean this up a little, probably also encapsulate it better
  $('#link-recent').bind('ajax:beforeSend', function(){
    $('#loading').show();
  });
  $('#link-recent').bind('ajax:success', function(event, data, status, xhr) {
    $('#content').html(data);
    clear_search_tags();
  });
  $('#link-recent').bind('ajax:complete', function(event, data, status, xhr) {
    $('#loading').hide();
  });
  
  $('#link-favorites').bind('ajax:beforeSend', function(){
    $('#loading').show();
  });
  $('#link-favorites').bind('ajax:success', function(event, data, status, xhr) {
    $('#content').html(data);
    clear_search_tags();
  });
  $('#link-favorites').bind('ajax:complete', function(event, data, status, xhr) {
    $('#loading').hide();
  });
  
  $('#link-home').bind('ajax:beforeSend', function(){
    $('#loading').show();
  });
  $('#link-home').bind('ajax:success', function(event, data, status, xhr) {
    $('#content').html(data);
    clear_search_tags();
  });
  $('#link-home').bind('ajax:complete', function(event, data, status, xhr) {
    $('#loading').hide();
  });
  
  $('#add_tags').bind('railsAutocomplete.select', function(event, data) {
    console.log('Data:' + data.item.name);
  });
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

refresh_tag_list = function(tag_list) {
  var $container;
  $container = $('#tag-list');
  $container.empty();
  $.each(tag_list, function(index, value) {
    $container.append('<li><a>' + value + "</a></li>");
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