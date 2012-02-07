class FavoriteEmote < ActiveRecord::Base
  default_scope order('created_at DESC')
  
  belongs_to :user
  belongs_to :emote

  # Q? Why do I have to set up my own getter/setter here?
  def get_id
    self.id
  end
end
