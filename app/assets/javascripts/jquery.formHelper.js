/*	FormHelper - 1.0.0
Copyright (c) 2010 NextMarvel

Dual licensed under MIT and GPL 2+ licenses
http://www.opensource.org/licenses

Examples:

	$("input").textReplacement({
		'activeClass': 'active',	//set :focus class
		'dataEnteredClass': 'data_entered', //set additional class for when data has been entered by the user
		'passwordText': 'PASSWORD'	//set default password text
	});
	
	$("form").scaffoldAjax({
		'validate': function() {
			//check validation
			return true;
		},
		'success': function(data) {
			//handle success
		}
	});

In addition to validate, scaffoldAjax takes any options that can be 
passed to $.ajax().  See http://api.$.com/$.ajax/ for details.
*/
(function($){$.fn.textReplacement=function(options){var settings={'activeClass':'active_formHelper','dataEnteredClass':'data_entered_formHelper','passwordText':''};if(options){$.extend(settings,options)}for(var i=0;i<this.length;i++){var elem=this[i];if(elem.tagName.toLowerCase()!="input"){continue}switch($(elem).attr('type').toLowerCase()){case'text':if($(elem).attr('defaultValue')==undefined){$(elem).attr('defaultValue',$(elem).val())}$(elem).focus(function(){if($(this).val()==$(this).attr('defaultValue')){$(this).val("")}$(this).addClass(settings.activeClass).addClass(settings.dataEnteredClass)});$(elem).blur(function(){if($(this).val()==""){$(this).val($(this).attr('defaultValue'));$(this).removeClass(settings.dataEnteredClass)}$(this).removeClass(settings.activeClass)});break;case'password':if(elem.value==""&&(($(elem).attr('alt')!=undefined&&$(elem).attr('alt')!="")||settings.passwordText!="")){if(elem.id==""){elem.id="formHelper_"+Math.round(Math.random()*10000)}replacement=document.createElement('input');replacement.className=elem.className;rtext=(elem.alt!="")?elem.alt:settings.passwordText;$(replacement).attr("id",elem.id+"_replacement").attr("type","text").attr("original",elem.id).val(rtext);$(replacement).focus(function(){$(this).hide();$("#"+$(this).attr("original")).show().focus().addClass(settings.activeClass).addClass(settings.dataEnteredClass)});$(elem).blur(function(){if(this.value==""){$("#"+$(this).attr("replacement")).show();$(this).removeClass(settings.activeClass).hide().removeClass(settings.dataEnteredClass)}else{$(this).removeClass(settings.activeClass)}});$(elem).attr("replacement",replacement.id).after(replacement).hide()}break}}};$.fn.scaffoldAjax=function(options){$(this).submit(function(){var settings={'data':$(this).serialize(),'type':$(this).attr('method'),'url':$(this).attr('action'),'validate':function(){return true}};if(options){$.extend(settings,options)}if(!settings.validate()){return false}delete settings.validate;$.ajax(settings);return false})}})(jQuery);