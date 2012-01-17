class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :signintest]
  
  def index
    @emote = Emote.first
    @emotes = Emote.all
  end
  
  def new
    @emote = Emote.new
  end
  
  def create
    @emote = Emote.new(params[:emote])
    @emote.owner_id = current_user.id
    
    if @emote.save
      # I can't decided if I like the new hash syntax yet.  Till I figure out if I like it or not
      # I'll keep up the status quo.
      redirect_to root_path, :notice => "#{@emote.text} successfully created"
    else
      format.html { render :action => "new", :notice => "Something went wrong creating the emote #{@emote.text}"}
    end
  end
  
  def update
    @emote = Emote.find(params[:id])
    @emote.tag_list = params[:emote][:tag_list]
    
    if @emote.save
       redirect_to root_path, :notice => "#{@emote.text} successfully updated"
    else
       redirect_to root_path, :notice => "#{@emote.text} failed update"
    end
  end
  
  def signintest
  end
  
  private
  
    def is_signed_in?
      redirect_if_not_logged_in
    end
end
