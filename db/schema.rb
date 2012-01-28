# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120128005720) do

  create_table "emotes", :force => true do |t|
    t.string   "text"
    t.string   "note"
    t.integer  "display_length"
    t.integer  "popularity",     :default => 0
    t.integer  "owner_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "total_clicks",   :default => 0
  end

  add_index "emotes", ["owner_id"], :name => "index_emotes_on_created_by"
  add_index "emotes", ["popularity"], :name => "index_emotes_on_popularity"

  create_table "favorite_emotes", :force => true do |t|
    t.integer  "emote_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "favorite_emotes", ["user_id"], :name => "index_favorite_emotes_on_user_id"

  create_table "recent_emotes", :force => true do |t|
    t.integer  "emote_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "recent_emotes", ["user_id"], :name => "index_recent_emotes_on_user_id"

  create_table "taggings", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       :limit => 128
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id"], :name => "index_taggings_on_tag_id"
  add_index "taggings", ["taggable_id", "taggable_type", "context"], :name => "index_taggings_on_taggable_id_and_taggable_type_and_context"

  create_table "tags", :force => true do |t|
    t.string "name"
  end

  create_table "users", :force => true do |t|
    t.string   "provider"
    t.string   "uid"
    t.string   "name"
    t.string   "oauth_token"
    t.string   "oauth_secret"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "nickname"
    t.string   "image"
    t.string   "url"
    t.string   "gender"
    t.string   "timezone"
    t.string   "website"
    t.string   "location"
  end

end
