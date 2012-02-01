module EmotesHelper
  include ActsAsTaggableOn::TagsHelper
  
  # Used to determine the sort selector's class
  def sort_status(field)
    @sort == field ? 'active' : 'inactive'
  end
  
  # Used to increase the font size on unicode graphic emoticons
  def custom_styles(emote)
    if (1..38).include? emote.id
      'style="font-size: 40px;"'
    end
  end
end
