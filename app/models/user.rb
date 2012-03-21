class User < ActiveRecord::Base
  attr_accessible nil
  
  acts_as_tagger
  
  has_many :accounts
  has_many :favorite_emotes
  has_many :emotes, :through => :favorite_emotes

  def update_with_account(account)
    self.name = account.name
    self.save!
  end

  def favorites
    @emotes = []
    FavoriteEmote.uncached do
      favorite_emotes = FavoriteEmote.where(:user_id => self.id).limit(self.favorites_count)
      favorite_emotes.each do |fe|
        @emotes  << Emote.find(fe.emote_id, :include => [:tags])
      end
    end
    @emotes
  end
end