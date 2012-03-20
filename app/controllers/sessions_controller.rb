class SessionsController < ApplicationController
  def new
  end

  def create
    auth = request.env["omniauth.auth"]
    account = Account.find_by_provider_and_uid(auth["provider"], auth["uid"]) 
    
    if account.nil?
      ActiveRecord::Base.transaction do
        user = User.create
        account = Account.create_with_omniauth auth, user
        user.update_with_account account
      end
    else
      # Conversion code
      if account.user.nil?
        account.transition_to_user_system User.create!
      end      
      account.update_with_omniauth auth
    end
    
    session[:user_id] = account.user.id
    redirect_to root_url, :notice => "Signed in!"
  end
  
  def destroy
    session[:user_id] = nil
    redirect_to root_url, :notice => "Signed out!"
  end
end
