class AddAccountTypeAndFavoritesCountAndRecentCountToUsers < ActiveRecord::Migration
  def change
    add_column :users, :account_type, :string, :default => 'normal'
    add_column :users, :favorites_count, :integer, :default => 15
    add_column :users, :recent_count, :integer, :default => 30
  end
end
