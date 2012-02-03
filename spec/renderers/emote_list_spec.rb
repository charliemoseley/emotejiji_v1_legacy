require 'spec_helper'
require 'emote_list'

describe 'EmoteList' do
  before(:each) do
    # I really need to create a factory for this, but till then, im going to
    # rely on the fact that I copy over my production database to my testing
    # dtabase
    @sort = 'newest'
    @emotes = Emote.tagged_with('anime')
    @list = EmoteList.new @emotes
    @list.sort_type = :newest
  end

  subject { @list }

  # Q? This doesnt work because the original value is wrapped in Active::Relation
  # while the returned value is an array
  describe "when order method is called with :newest" do
    before do
      @original_list = @emotes.dup
      @list.sort_type = :newest
    end

    it { should == @original_list }
  end
end