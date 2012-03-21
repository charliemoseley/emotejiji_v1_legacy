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

  # Formats the emotes tag list as a javascript array to be eval()'d
  def favorites_js_array(emotes)
    unless emotes.nil? || emotes[0].nil?
      formatted = Array(emotes.to_a).map { |emote| emote.id }.join(", ")
    end
    "[#{formatted}]"
  end
end
