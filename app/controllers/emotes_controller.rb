class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :signintest]
  
  def index
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
    end
  end
  
  def signintest
  end
  
  private
  
    def is_signed_in?
      redirect_if_not_logged_in
    end
end
