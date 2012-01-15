class EmotesController < ApplicationController
  before_filter :is_signed_in?, :only => [:new, :update, :signintest]
  
  def index
  end
  
  def new
  
  end
  
  def create
  
  end
  
  def signintest
  end
  
  private
  
    def is_signed_in?
      redirect_if_not_logged_in
    end
end
