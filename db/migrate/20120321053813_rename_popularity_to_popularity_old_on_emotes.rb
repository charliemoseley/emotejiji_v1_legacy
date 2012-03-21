class RenamePopularityToPopularityOldOnEmotes < ActiveRecord::Migration
  def change
    rename_column :emotes, :popularity, :popularity_old
  end
end
