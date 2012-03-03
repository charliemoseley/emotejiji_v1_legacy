class CreateSubscriptions < ActiveRecord::Migration
  def change
    create_table :subscriptions do |t|
      t.integer :user_id
      t.stringrails :stripe_token
      t.string :g
      t.string :model
      t.string :Subscription
      t.integer :user_id
      t.string :stripe_token
      t.string :plan
      t.string :duration
      t.float :denomination
      t.boolean :valid
      t.string :error

      t.timestamps
    end
  end
end
