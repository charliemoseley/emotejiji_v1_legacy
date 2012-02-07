class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user, :is_logged_in?, :determine_remote_status
  
  private
  
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
  
  def is_logged_in?
    current_user ? true : false
  end
  
  # Used to change whether the top navigation links are remote or not depending
  # on the current loaded page/
  def determine_remote_status
    current_uri = request.env['PATH_INFO']
    case current_uri
      when '/about'
      when '/emotes/new'
      when '/profile'
        false
      else
        true
    end
  end
  
  def redirect_if_not_logged_in
    if current_user.nil?
      redirect_to root_path, :notice => 'Please Log In'
    end
  end
end
