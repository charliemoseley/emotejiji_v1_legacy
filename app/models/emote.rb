class Emote < ActiveRecord::Base
  attr_accessible :text, :note, :tag_list
  
  # Q?: Figure out how to set this properly ->
  # belongs_to :user, :foreign_key => "owner_id", :class_name => "Owner"
  
  # Q?: I want to setup easy functions so I can go current_user.recents and current_user.favorites
  # to get the appropriate emotes, but not sure how to do that with polymorphic + has_many :through
  # and  maintain the proper order and caching I want
  has_many :recent_emotes
  has_many :users, :through => :recent_emotes
  
  acts_as_taggable_on :tags
  
  # Guesstimates the width of an emote unless specifically provided
  def width
    unless self.display_length.nil?
      self.display_length
    else
      if self.text.length > 23
        3
      elsif self.text.length > 10
        2
      else
        1
      end
    end
  end
  
  # Formats the emotes tag list as a javascript array to be eval()'d
  def tag_list_js
    formatted = self.tag_list.map { |tag| "'" + tag + "'" }.join(",")
    "[#{formatted}]"
  end
end
