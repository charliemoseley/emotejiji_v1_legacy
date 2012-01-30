# This class takes a list of emoticons and makes sure they fill a grid of
# x length nicely while still attempting to best retain the order the
# emoticons are supposed to be rendered in.
class EmoteListSorter
  attr_accessor :emote_list, :list_length
  
  def initialize(emote_list, list_length = 4)
    @emote_list  = emote_list
    @list_length = list_length
    
    @position = 0
    @overflow = Array.new
    @return   = Array.new
  end
  
  def sort
    render_list
    @return
  end
  
  def pass_through
    @emote_list
  end
  
  private
  
  def render_list
    @emote_list.each do |emote|
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
  end
end