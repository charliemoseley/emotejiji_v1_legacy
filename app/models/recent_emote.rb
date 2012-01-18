class RecentEmote < ActiveRecord::Base
  belongs_to :user
  belongs_to :emote
end
