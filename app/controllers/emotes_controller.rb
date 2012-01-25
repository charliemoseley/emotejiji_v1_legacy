class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :recent]
  autocomplete :tag, :name
  
  def index
    # Q? This is a hack so I can use a form helper that automatically has the fields for 
    # updating an emote.  Any more elegant solution?
    @emote = Emote.first
    @display_type = 'all'
    
    @sort = params[:sort].nil? ? 'newest' : params[:sort]
    case @sort
    when 'newest'
      @emotes = Emote.order('id DESC').all
    when 'popular'
      @emotes = Emote.order('popularity DESC').all
    when 'random'
      emotes = Emote.all
      @emotes = emotes.sort_by { rand }
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
    # Takes the tag that was submitted by the user and attributes that to them
    current_user.tag(@emote, :with => @emote.tag_list.first, :on => :tags)
    
    if @emote.save
       redirect_to root_path, :notice => "#{@emote.text} successfully updated"
    else
       redirect_to root_path, :notice => "#{@emote.text} failed update"
    end
  end
  
  def recent
    @emote = Emote.first
    @display_type = 'recent'
    @sort = 'disable'
    
    # Q? Couldn't really figure out a good way to do do this with current_user.emotes while getting the right search
    # order and disabling query caching.
    RecentEmote.uncached do
      recent_emotes = RecentEmote.where(:user_id => current_user.id).limit(30)
      
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
    @display_type = 'favorites'
    @sort = 'disable'
    
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
  
  def tag_search
    @display_type = 'search'
    
    tags = params[:tags]
    @sort = params[:sort]
    json = { 'status' => '', 'view' => ''}
    
    # Check first if we even have any tags being submitted
    unless tags.nil?
      # If we do have tags, we handle all the searching
      new_tag = tags.first.downcase
      
      # Run a query against the newest tag to determine if it is even in the database
      tag_from_db = Tag.where :name => new_tag
      if new_tag.length == 0 || !tag_from_db.empty?
        # If the tag exists, attempt to find emotes that fit all the tags submitted
        emotes = Emote.tagged_with(tags)
        case @sort
        when 'newest'
          @emotes = emotes.sort_by {|emote| emote.id }
          @emotes.reverse!
        when 'random'
          @emotes = emotes.sort_by { rand }
        when 'popular'
          @emotes = emotes.sort_by {|emote| emote.popularity }
          @emotes.reverse!
        end
        
        
        # Updated the return with wheter results where found and with the view
        if(@emotes.count >= 1)
          json[:status] = 'valid_results'
        else
          json[:status] = 'no_results'
        end
        json[:view] = render_to_string :partial => "emotes/emote_list", :locals => { :emotes => @emotes, :sort => @sort }, :layout => false
      else
        # Otherwise the newest submitted tag doesn't exist in our database
        json[:status] = 'invalid_tag'
      end
    else
      # Otherwise we just return the full list again
      @emotes = Emote.all
      @display_type = 'all'
      json[:status] = 'reset_results'
      json[:view] = render_to_string :partial => "emotes/emote_list", :locals => { :emotes => @emotes, :sort => @sort }, :layout => false
    end
    
    render :json => json
  end
  
  private
  
    def is_signed_in?
      redirect_if_not_logged_in
    end
end
