class Emote < ActiveRecord::Base
  attr_accessible :text, :note
  
  belongs_to :user, :class_name => "Owner", :foreign_key => "owner_id"
  
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
end
