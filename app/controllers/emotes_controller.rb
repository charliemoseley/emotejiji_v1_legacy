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
    @emote.text.strip!
    @emote.tag_list
    current_user.tag(@emote, :with => @emote.tag_list, :on => :tags)
    
    # ToDo: Make the database enforce uniquness + Pretty up the error page on new emotes
    if @emote.save
      redirect_to root_path, :notice => "#{@emote.text} successfully created"
    else
      render "new", :notice => "Something went wrong creating the emote #{@emote.text}"
    end
  end
  
  def update
    @emote = Emote.find(params[:id])
    @emote.tag_list.add(params[:emote][:tag_list].downcase)
    # Update the popularity value by 2
    @emote.popularity = @emote.popularity + 1
    
    # Q?: Is this what I really hae to do to achieve ownership tags with act-as-taggable-on?
    owner_tags = @emote.owner_tags_on(current_user, :tags).map {|t| t.name }
    unless owner_tags.include? params[:emote][:tag_list]
      temp_string = owner_tags.join(', ')
      temp_string = temp_string + ', ' + params[:emote][:tag_list]
      current_user.tag(@emote, :with => temp_string, :on => :tags)
    end
    
    
    
    if @emote.save
      respond_to do |format|
        format.html do
          if request.xhr?
            render :json => @emote.tag_list
          else
            redirect_to root_path, :notice => "#{@emote.text} succesfully created"
          end
        end
      end
    else
       redirect_to root_path, :notice => "#{@emote.text} failed update"
    end
  end
  
  def profile
    # ToDo: Currently doesnt render properly when directly loaded from the URL
    respond_to do |format|
      format.html do
        if request.xhr?
         render :profile, :layout => false
        else
          render :profile
        end
      end
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
    
    # Update the popularity value by 1
    emote = Emote.find(params[:id])
    emote.popularity = emote.popularity + 1
    emote.total_clicks = emote.total_clicks + 1
    emote.save
    
    render :text => ''
  end
  
  # ToDo: Make it so that when you favorite an emote, on the view it'll update the button text
  # allowing you to unfavorite.
  def record_favorite
    unless current_user.nil?
      favorite_emote = FavoriteEmote.where :user_id => current_user.id, :emote_id => params[:id]
      emote = Emote.find(params[:id])
      
      # Update the popularity value by 4
      emote.popularity = emote.popularity + 5
      emote.save
      
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
    @sort = params[:sort]
    
    tag_list = []
    tag_list = params[:tag_list] unless params[:tag_list].nil?
    tag = params[:tag]
    json = { 'status' => '', 'view' => ''}
    
    tag.downcase! rescue nil
    tag_list << tag unless tag.nil?
    
    # Check if we are searching on anything at all
    if tag_list.length != 0
      
      # If we are, see if we were submitted a new tag to search on
      # and check to see if that tag exists in the database
      unless tag.nil?
        if Tag.where(:name => tag).empty?
          json[:status] = 'invalid_tag'
          render :json => json
          return
        end
      end
      
      # Since tags are good, lets go fetch emotes with those tags
      emotes = Emote.tagged_with(tag_list)
      # Q?: This doesnt seem right.  We dont want our SQL to ever grab duplicates?
      emotes.uniq!
      
      # Process the order to display the emotes via the sort method
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
      
      # Ship back the results
      json[:status] = @emotes.count >= 1 ? 'valid_results' : 'no_results'
      json[:view] = render_to_string :partial => "emotes/emote_list", :locals => { :emotes => @emotes, :sort => @sort }, :layout => false
    else
      # Otherwise we just return the full list again
      @emotes = Emote.all
      @display_type = 'all'
      json[:status] = 'reset_results'
      json[:view] = render_to_string :partial => "emotes/emote_list", :locals => { :emotes => @emotes, :sort => @sort }, :layout => false
    end
    
    # Finally render the view back out
    render :json => json
  end
  
  private
  
    def is_signed_in?
      redirect_if_not_logged_in
    end
end
