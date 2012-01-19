class CreateFavoriteEmotes < ActiveRecord::Migration
  def change
    create_table :favorite_emotes do |t|
      t.integer :emote_id
      t.integer :user_id

      t.timestamps
    end
    
    change_table :favorite_emotes do |t|
      t.index :user_id
    end
  end
end
