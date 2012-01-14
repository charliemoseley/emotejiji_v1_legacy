class CreateEmotes < ActiveRecord::Migration
  def change
    create_table :emotes do |t|
      t.string :text
      t.string :note
      t.integer :display_length
      t.integer :popularity, :default => 0
      t.integer :created_by

      t.timestamps
    end
    
    change_table :emotes do |t|
      t.index :popularity
      t.index :created_by
    end
  end
end
