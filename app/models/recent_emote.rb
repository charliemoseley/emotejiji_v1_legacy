class RecentEmote < ActiveRecord::Base
  belongs_to :user
  belongs_to :emote
  
  default_scope order('updated_at DESC')
end
