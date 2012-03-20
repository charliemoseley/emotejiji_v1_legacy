class CreateUser < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string  :name
      t.string  :account_type,     :default => 'normal'
      t.integer :favorites_count,  :default => 15
      t.integer :recent_count,     :default => 30

      t.timestamps
    end
  end
end
