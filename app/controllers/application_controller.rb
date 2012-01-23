class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user, :is_logged_in?
  
  private
  
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
  
  def is_logged_in?
    current_user ? true : false
  end
  
  def redirect_if_not_logged_in
    if current_user.nil?
      redirect_to root_path, :notice => 'Please Log In'
    end
  end
end
