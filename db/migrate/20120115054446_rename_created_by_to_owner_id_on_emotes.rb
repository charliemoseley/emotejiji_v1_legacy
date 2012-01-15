class RenameCreatedByToOwnerIdOnEmotes < ActiveRecord::Migration
  def change
    rename_column :emotes, :created_by, :owner_id
  end
end
