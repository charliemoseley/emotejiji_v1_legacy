module EmotesHelper
  
  # Used to increase the font size on unicode graphic emoticons
  def custom_styles(emote)
    if (1..38).include? emote.id
      'style="font-size: 40px;"'
    end
  end
end
