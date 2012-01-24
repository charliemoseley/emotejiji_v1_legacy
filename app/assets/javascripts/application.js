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
  
  $('#sort-list-active li').live('click', function() {
    console.log('toggle ran');
    $('#sort-list-inactive').toggle('slide');
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