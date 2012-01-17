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

init = function() {
  
}

emoticon_clicked = function($container) {
  var emoticon, note;
  
  emoticon = $container.children('article');
  note = $container.children('aside');
  $('#selected-emoticon').text(emoticon.text());
  $('#selected-note').text(note.text());
}