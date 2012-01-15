class Emote < ActiveRecord::Base
  attr_accessible :text, :note
  
  belongs_to :user, :class_name => "Owner", :foreign_key => "owner_id"
end
