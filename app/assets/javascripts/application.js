// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require plugins
//= require jquery
//= require jquery_ujs
//= require_tree .

// No clue how to write my jQuery in CoffeeScript (though I do want to try to convert it over at some
// point.  Till then, pure JS below.

$(document).ready(function() {
  $('#emoticon-list li').click(function() { emoticon_clicked($(this)) });
});

emoticon_clicked = function($container) {
  var emoticon, note, id, $form;
  $form = $('#emoticon-display form');
  
  id = $container.attr('id').substring(6);
  emoticon = $container.children('article').text();
  note = $container.children('aside').text();
  tag_list = eval($container.children('input').val());
  
  
  // $('#selected-id').val(id)
  // Q? This is tightly bound to the model, any way we can better abstract this?
  $form.attr('action', '/emotes/' + id);
  $form.attr('id', 'edit_emote_' + id);
  $('#selected-emoticon').text(emoticon);
  $('#selected-note').text(note);
  refresh_tag_list(tag_list);
}

refresh_tag_list = function(tag_list) {
  var $container;
  $container = $('#tag-list');
  $container.empty();
  $.each(tag_list, function(index, value) {
    $container.append('<li><a>' + value + "</a></li>");
  });
}