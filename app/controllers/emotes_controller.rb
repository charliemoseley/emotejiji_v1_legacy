class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :recent]
  
  def index
    # Q? This is a hack so I can use a form helper that automatically has the fields for 
    # updating an emote.  Any more elegant solution?
    @emote = Emote.first
    @emotes = Emote.all
    
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
    
    # Q? Couldn't really figure out a good way to do do this with current_user.emotes while getting the right search
    # order and disabling query caching.
    RecentEmote.uncached do
      recent_emotes = RecentEmote.where(:user_id => current_user.id).limit(15)
      
      @emotes = []
      recent_emotes.each do |re|
        @emotes << Emote.find(re.emote_id)
      end
    end
    
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
  
  def favorites
    @emote = Emote.first
    
    FavoriteEmote.uncached do
      favorite_emotes = FavoriteEmote.where(:user_id => current_user.id).limit(15)
      
      @emotes = []
      favorite_emotes.each do |fe|
        @emotes << Emote.find(fe.emote_id)
      end
    end
    
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
  
  def record_recent
    unless current_user.nil?
      recent_emote = RecentEmote.where :user_id => current_user.id, :emote_id => params[:id]
       # Q? Most elegant way to handle this?
      if recent_emote.empty?
        recent_emote = RecentEmote.new
        recent_emote.user_id = current_user.id
        recent_emote.emote_id = params[:id]
      else
        recent_emote = recent_emote[0]
      end
      recent_emote.updated_at = Time.now
      recent_emote.save
    end
    render :text => ''
  end
  
  # ToDo: Make it so that when you favorite an emote, on the view it'll update the button text
  # allowing you to unfavorite.
  def record_favorite
    unless current_user.nil?
      favorite_emote = FavoriteEmote.where :user_id => current_user.id, :emote_id => params[:id]
      emote = Emote.find(params[:id])
      
      if favorite_emote.empty?
        favorite_emote = FavoriteEmote.new
        favorite_emote.user_id = current_user.id
        favorite_emote.emote_id = params[:id]
        favorite_emote.save
        
        render :text => "#{emote.text} successfully saved as a favorite."
      else
        render :text => "#{emote.text} is already saved as a favorite."
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
