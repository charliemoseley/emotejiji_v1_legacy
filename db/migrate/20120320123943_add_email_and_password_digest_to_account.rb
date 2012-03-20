class AddEmailAndPasswordDigestToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :email, :string

    add_column :accounts, :password_digest, :string

  end
end
