class AdminController < ApplicationController
  before_filter :is_admin?

  def index
    @users = User.all
  end

  private
  def is_admin?
    redirect_if_not_logged_in
  end  

end
