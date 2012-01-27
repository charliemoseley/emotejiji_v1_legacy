class AddFieldsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :nickname, :string
    add_column :users, :image, :string
    add_column :users, :url, :string
    add_column :users, :gender, :string
    add_column :users, :timezone, :string
  end
end
