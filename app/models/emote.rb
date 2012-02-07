class Emote < ActiveRecord::Base
  attr_accessible :text, :note, :tag_list
  
  # Q?: Figure out how to set this properly ->
  # belongs_to :user, :foreign_key => "owner_id", :class_name => "Owner"
  
  # Q?: I want to setup easy functions so I can go current_user.recents and current_user.favorites
  # to get the appropriate emotes, but not sure how to do that with polymorphic + has_many :through
  # and  maintain the proper order and caching I want
  has_many :favorite_emotes
  has_many :users, :through => :favorite_emotes
  
  acts_as_taggable_on :tags
  
  default_scope order('created_at DESC')
  
  #validates :text, :uniqueness => true
  #validates :text, :presence => true
  
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

  def is_favorite? (user)
    count = self.users.where id: user.id
    return count.empty? ? false : true
  end

  ### Class Methods ###
  def self.tag_descendants(emote_list, tag_list)
    emote_list = Array(emote_list)
    tag_list   = Array(tag_list)
    possible_tags = []
    
    # If we don't have any tags submitted, there is no descendants, so return
    # all tags.
    if tag_list.empty? 
      return Emote.all_tags
    end
    
    # Take all the tags from the list of emotes and put them into a single array
    emote_list.each do |emote|
      # Q? Why does this not work?
      #possible_tags << emote.tag_list.each { |tag| tag }
      emote.tag_list.each { |tag| possible_tags << tag }
    end
    
    # Remove the duplicates
    possible_tags.uniq!
    
    tag_list.each do |tag|
      possible_tags.delete_if { |t| t == tag }
    end
    possible_tags
  end
  
  def self.all_tags
    Emote.tag_counts_on(:tags).map! {|tag| tag.name }
  end
end