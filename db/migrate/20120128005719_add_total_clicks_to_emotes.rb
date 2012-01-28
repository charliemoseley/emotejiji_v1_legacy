class AddTotalClicksToEmotes < ActiveRecord::Migration
  def change
    add_column :emotes, :total_clicks, :integer
    change_column :emotes, :popularity, :integer, :default => 0
  end
end
