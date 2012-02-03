require 'spec_helper'

describe Emote do
  before(:each) do
    # Q? Do I create a user with a factory?
    @user  = User.new( { provider: 'name', uid: '111111111', name: 'Test User'} )
    @emote = Emote.new( { text: 'xD', note: 'generic emote' } )
    @emote.owner_id = @user
  end

  subject { @emote }

  # Attribute Accessiblity Checks
  it { should respond_to(:text) }
  it { should respond_to(:note) }
  it { should respond_to(:display_length) }

  # Sanity Checks
  it { should be_valid }

  # Q? This is broken
  # describe "when in accessible attributes are attempted to be saved" do
  #   before { @emote.merge( { popularity: 1, owner_id: 1, total_clicks: 1 } ) }
  #   it { should_not be_valid }
  # end

  describe "when text length is less than 10" do
    before { @emote.text = 'a' * 9 }
    it { @emote.width.should be 1 }
  end

  describe "when text lenght is less greater than 10 but less 23" do
    before { @emote.text = 'a' * 22 }
    it { @emote.width.should be 2 }
  end

  describe "when text lenght is less greater than 23" do
    before { @emote.text = 'a' * 100 }
    it { @emote.width.should be 3 }
  end

  describe "when display_length is set" do
    before { @emote.display_length = 2; @emote.text = 'a' * 1000 }
    it { @emote.width.should be 2 }
  end
end