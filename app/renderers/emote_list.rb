# This class takes a list of emoticons and makes sure they fill a grid of
# x length nicely while still attempting to best retain the order the
# emoticons are supposed to be rendered in.
class EmoteList
  attr_accessor :emotes, :sort_type, :list_length
  
  def initialize(emotes, options = {})
    options.reverse_merge! :list_length => 4, :sort_type => :newest
    @emotes      = emotes.uniq
    @sort_type   = options[:sort_type].to_sym
    @list_length = options[:list_length]
    
    @position = 0
    @overflow = Array.new
    @return   = Array.new
  end
  
  def sort
    @emotes = order
    @emotes = render_list
  end
  
  def self.sort_now(emotes, options = {})
    emoteList = []
    benchmark = Benchmark.realtime { emoteList = EmoteList.new emotes, options }
    Rails.logger.info "***"*80
    Rails.logger.info "[BENCHMARK]: Sort #{options[:sort_type]}: #{benchmark}"
    return emoteList.sort
  end
    
  private
  
  def order
    case @sort_type
    when :random
      @emotes.sort_by! { rand }
    when :popular
      #@emotes.sort_by! {|emote| emote.popularity }
      # Need to reprogram this to use redis sets
      @emotes.sort_by! {|emote| Emote.popularity[emote.id]}
      @emotes.reverse!
    when :newest
      # Due to the default scoping of the emote's model, the emote_list will
      # always already be sorted this way
      @emotes
    end
    # Return emotes again just in case a case slips through not addressed above
    @emotes
  end
  
  
  def render_list
    @emotes.each do |emote|
      # First check if the overflow array has any emotes
      unless @overflow.length == 0
        # If so loop over them
        @overflow.each_with_index do |oemote, index|
          # Check if they can be positioned into the grid
          unless @position + oemote.width >  @list_length
            # If so, add it to the grid, remove it from the overflow
            @return.push oemote
            @overflow.delete_at index
            
            # Update the position and do a position check
            @position = @position + oemote.width
            if @position ==  @list_length
              @position = 0 
            end
          end
        end
      end
      
      # Do the same thing with the current emote except if an
      # overflow occurs, put that emote into the overflow array
      unless @position + emote.width >  @list_length
        @return.push emote
        
        @position = @position + emote.width
        if @position ==  @list_length
          @position = 0 
        end
      else
        @overflow.push emote
      end
    end
    
    # Whatever is left over, just push at the end
    @overflow.each do |emote|
      @return.push emote
    end
    @return
  end
end