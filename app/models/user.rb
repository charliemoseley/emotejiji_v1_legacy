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
end