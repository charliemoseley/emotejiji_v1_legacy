class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :recent]
  
  def index
    # Q? This is a hack so I can use a form helper that automatically has the fields for 
    # updating an emote.  Any more elegant solution?
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
  
  def recent
    @emote = Emote.first
    @emotes = Emote.limit(5)
    
    # Q? Most elegant way to handle this?
    respond_to do |format|
      format.html do
        if request.xhr?
         render :partial => "emotes/emote_list", :locals => { :emotes => @emotes }, :layout => false
        else
          render :index
        end
      end
    end
  end
  
  def signintest
  end
  
  private
  
    def is_signed_in?
      redirect_if_not_logged_in
    end
end
