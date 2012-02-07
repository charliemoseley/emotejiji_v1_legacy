class User < ActiveRecord::Base
  
  acts_as_tagger
  
  has_many :favorite_emotes
  has_many :emotes, :through => :favorite_emotes
  
  def self.create_with_omniauth(auth)
    create! do |user|
      user.provider       = auth['provider']
      user.uid            = auth['uid']
      user.name           = auth['info']['name'] rescue nil
      user.nickname       = auth['info']['nickname'] rescue nil
      user.image          = auth['info']['image'] rescue nil
      user.url            = auth['info']['urls']['Twitter'] rescue nil
      user.website        = auth['info']['urls']['Website'] rescue nil
      user.location       = auth['info']['location'] rescue nil
      user.timezone       = auth['extra']['raw_info']['time_zone'] rescue nil
      user.oauth_token    = auth['credentials']['token']  rescue nil
      user.oauth_secret   = auth['credentials']['secret'] rescue nil
    end
  end
end

#website, location