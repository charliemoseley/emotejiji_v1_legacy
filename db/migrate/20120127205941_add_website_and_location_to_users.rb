class AddWebsiteAndLocationToUsers < ActiveRecord::Migration
  def change
    add_column :users, :website, :string
    add_column :users, :location, :string
  end
end
