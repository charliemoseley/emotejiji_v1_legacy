class UpdateTotalClicksOnEmotes < ActiveRecord::Migration
  def change
    change_column :emotes, :total_clicks, :integer, :default => 0
  end
end
