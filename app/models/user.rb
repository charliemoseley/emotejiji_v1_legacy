class User < ActiveRecord::Base
  
  acts_as_tagger
  
  has_many :recent_emotes
  has_many :emotes, :through => :recent_emotes
  
  def self.create_with_omniauth(auth)
    create! do |user|
      user.provider = auth["provider"]
      user.uid = auth["uid"]
      user.name = auth["info"]["name"]
    end
  end
end
