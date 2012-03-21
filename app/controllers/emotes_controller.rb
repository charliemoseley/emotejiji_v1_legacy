class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :recent]
  autocomplete :tag, :name
  helper_method :to_js_array
  
  def index
    # Q? This is a hack so I can use a form helper that automatically has the fields for 
    # updating an emote.  Any more elegant solution?
    
    @emote = Emote.first
    @display_type = 'all'
    @tags = Emote.tag_counts_on(:tags)

    @sort = params[:sort].nil? ? :newest : params[:sort].to_sym
    
    @emotes = EmoteList.sort_now Emote.all_cached, :sort_type => @sort
    
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
      Rails.cache.delete('Emotes.all')
      redirect_to root_path, :notice => "#{@emote.text} successfully created"
    else
      render "new", :notice => "Something went wrong creating the emote #{@emote.text}"
    end
  end
  
  def update
    @emote = Emote.find(params[:id])
    @emote.tag_list.add(params[:emote][:tag_list].downcase)
    # Update the popularity value by 1
    @emote.popularity.increment
    #@emote.popularity = @emote.popularity + 1
    
    # Q?: Is this what I really hae to do to achieve ownership tags with act-as-taggable-on?
    owner_tags = @emote.owner_tags_on(current_user, :tags).map {|t| t.name }
    unless owner_tags.include? params[:emote][:tag_list]
      temp_string = owner_tags.join(', ')
      temp_string = temp_string + ', ' + params[:emote][:tag_list]
      current_user.tag(@emote, :with => temp_string, :on => :tags)
    end
    
    if @emote.save
      Rails.cache.delete('Emotes.all')
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
    @sort = :disable
    @tags = Emote.tag_counts_on(:tags)
    
    # Q? Couldn't really figure out a good way to do do this with current_user.emotes while getting the right search
    # order and disabling query caching.
    RecentEmote.uncached do
      recent_emotes = RecentEmote.where(:user_id => current_user.id).limit(current_user.recent_count)
      
      @emotes = []
      recent_emotes.each do |re|
        @emotes  << Emote.find(re.emote_id, :include => [:tags])
      end
    end
    @emotes = EmoteList.sort_now @emotes, :sort_type => @sort
    
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
    @sort = :disable
    @tags = Emote.tag_counts_on(:tags)
    
    FavoriteEmote.uncached do
      favorite_emotes = FavoriteEmote.where(:user_id => current_user.id).limit(15)
      
      @emotes = []
      favorite_emotes.each do |fe|
        @emotes  << Emote.find(fe.emote_id, :include => [:tags])
      end
    end
    @emotes = EmoteList.sort_now @emotes, :sort_type => @sort
    
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
    emote = Emote.find(params[:id])

    unless current_user.nil?
      recent_emote = RecentEmote.where :user_id => current_user.id, :emote_id => emote.id
       # Q? Most elegant way to handle this?
      if recent_emote.empty?
        recent_emote = RecentEmote.new
        recent_emote.user_id = current_user.id
        recent_emote.emote_id = emote.id
      else
        recent_emote = recent_emote[0]
      end
      recent_emote.updated_at = Time.now
      recent_emote.save
    end
    
    # Update the popularity value by 1
    
    # emote.popularity = emote.popularity + 1
    # emote.total_clicks = emote.total_clicks + 1
    # emote.save
    emote.clicks.increment
    emote.popularity.increment
    
    render :text => ''
  end
  
  # ToDo: Make it so that when you favorite an emote, on the view it'll update the button text
  # allowing you to unfavorite.
  def record_favorite
    unless current_user.nil?
      if params[:actionToDo] == 'add'
        if current_user.emotes.count <= current_user.favorites_count
        
          favorite_emote = FavoriteEmote.where :user_id => current_user.id, :emote_id => params[:id]
          emote = Emote.find(params[:id])
          
          # Update the popularity value by 4
          # emote.popularity = emote.popularity + 4
          emote.popularity.incr 4
          emote.favorites.increment
          emote.favorites_all_time.increment
          
          if favorite_emote.empty?
            favorite_emote = FavoriteEmote.new
            favorite_emote.user_id = current_user.id
            favorite_emote.emote_id = params[:id]
            favorite_emote.save
            
            render :text => "#{emote.text} successfully saved as a favorite."
          else
            render :text => "#{emote.text} is already saved as a favorite."
          end
        else
          render :text => "You have reached your maximum allocation of favorites."
        end
      elsif params[:actionToDo] == 'remove'
        favorite_emote = FavoriteEmote.where :user_id => current_user.id, :emote_id => params[:id]
        emote = Emote.find(params[:id])

        emote.popularity.decr 4
        emote.favorites.decrement
        #emote.popularity = emote.popularity - 2
        
        unless favorite_emote.empty?
          favorite_emote.first.destroy

          render :text => "#{emote.text} favorite successfully deleted."
        else
          render :text => "No favorite for #{emote.text} found."
        end
      end
    end
  end
  
  def tag_search
    @display_type = 'search'
    json = { :status => '', :view => '', :tag_descendants => '' }
    
    @sort    = params[:sort].nil?     ? :newest : params[:sort].to_sym
    tag      = params[:tag].nil?      ? ''      : params[:tag].downcase.strip
    tag_list = params[:tag_list].nil? ? []      : params[:tag_list] 
    tag_list << tag unless tag.empty?
    
    # Check if we are searching on anything at all
    if !tag_list.empty?
      # If we are, see if we were submitted a new tag to search on
      # and check to see if that tag exists in the database
      unless tag.empty?
        if Tag.where(:name => tag).empty?
          json[:status] = 'invalid_tag'
          render :json => json
          return
        end
      end
      
      # Since tags are good, lets go fetch emotes with those tags
      @emotes = EmoteList.sort_now Emote.tagged_with(tag_list), :sort_type => @sort
      json[:tag_descendants] = to_js_array Emote.tag_descendants @emotes, tag_list
      
      # Ship back the results
      json[:status] = @emotes.count >= 1 ? 'valid_results' : 'no_results'
      json[:view] = render_to_string :partial => "emotes/emote_list", :locals => { :emotes => @emotes, :sort => @sort }, :layout => false
    else
      # Otherwise we just return the full list again
      @emotes = EmoteList.sort_now Emote.all_cached, :sort_type => @sort
      tag_descendants = Emote.tag_descendants @emotes, tag_list
      json[:tag_descendants] = to_js_array tag_descendants
      
      @display_type = 'all'
      json[:status] = 'reset_results'
      json[:view] = render_to_string :partial => "emotes/emote_list", :locals => { :emotes => @emotes, :sort => @sort }, :layout => false
    end
    
    # Finally render the view back out
    render :json => json
  end
  
  private
  
  # Formats the emotes tag list as a javascript array to be eval()'d
  def to_js_array(array)
    unless array.nil? || array[0].nil?
      logger.info array.class
      if !array[0].respond_to? 'name'
        formatted = Array(array.to_a).map { |tag| "'" + tag + "'" }.join(",")
      else
        formatted = Array(array.to_a).map { |tag| "'" + tag.name + "'" }.join(",")
      end
    end
    # Take the tag list and put in unique so we dont calculate in the extra tags
    # from others tagging said emote.
    #formatted = self.tags.uniq
    "[#{formatted}]"
  end
  
  def is_signed_in?
    redirect_if_not_logged_in
  end  
end
