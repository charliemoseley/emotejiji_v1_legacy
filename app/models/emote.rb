class Emote < ActiveRecord::Base
  attr_accessible :text, :note, :tag_list
  
  belongs_to :user, :class_name => "Owner", :foreign_key => "owner_id"
  
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
