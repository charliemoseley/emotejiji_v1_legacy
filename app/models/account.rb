class Account < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :user

  def update_with_omniauth(auth)
    self.provider       = auth['provider']
    self.uid            = auth['uid']
    self.name           = auth['info']['name'] rescue nil
    self.email          = auth['info']['email'] rescue nil
    self.nickname       = auth['info']['nickname'] rescue nil
    self.image          = auth['info']['image'] rescue nil
    self.website        = auth['info']['urls']['Website'] rescue nil
    self.location       = auth['info']['location'] rescue nil
    self.oauth_token    = auth['credentials']['token']  rescue nil
    self.oauth_secret   = auth['credentials']['secret'] rescue nil

    if auth['provider'] == 'twitter'
      self.url            = auth['info']['urls']['Twitter'] rescue nil
      self.timezone       = auth['extra']['raw_info']['time_zone'] rescue nil
    elsif auth['provider'] == 'facebook'
      self.url            = auth['info']['urls']['Facebook'] rescue nil
      self.timezone       = auth['extra']['account_hash']['time_zone'] rescue nil
      self.gender         = auth['extra']['account_hash']['gender'] rescue nil
    end

    self.save!
  end

  def transition_to_user_system(user)
    self.user = user
    self.save!
  end

  def self.create_with_omniauth(auth, user)
    create! do |account|
      account.provider       = auth['provider']
      account.uid            = auth['uid']
      account.user           = user
      account.name           = auth['info']['name'] rescue nil
      account.email          = auth['info']['email'] rescue nil
      account.nickname       = auth['info']['nickname'] rescue nil
      account.image          = auth['info']['image'] rescue nil
      account.website        = auth['info']['urls']['Website'] rescue nil
      account.location       = auth['info']['location'] rescue nil
      account.oauth_token    = auth['credentials']['token']  rescue nil
      account.oauth_secret   = auth['credentials']['secret'] rescue nil

      if auth['provider'] == 'twitter'
        account.url            = auth['info']['urls']['Twitter'] rescue nil
        account.timezone       = auth['extra']['raw_info']['time_zone'] rescue nil
      elsif auth['provider'] == 'facebook'
        account.url            = auth['info']['urls']['Facebook'] rescue nil
        account.timezone       = auth['extra']['account_hash']['time_zone'] rescue nil
        account.gender         = auth['extra']['account_hash']['gender'] rescue nil
      end
    end
  end
end