CREATE TABLE "emotes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar(255), "note" varchar(255), "display_length" integer, "popularity" integer DEFAULT 0, "owner_id" integer, "created_at" datetime, "updated_at" datetime, "total_clicks" integer DEFAULT 0);
CREATE TABLE "favorite_emotes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "emote_id" integer, "user_id" integer, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "recent_emotes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "emote_id" integer, "user_id" integer, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "schema_migrations" ("version" varchar(255) NOT NULL);
CREATE TABLE "taggings" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "tag_id" integer, "taggable_id" integer, "taggable_type" varchar(255), "tagger_id" integer, "tagger_type" varchar(255), "context" varchar(128), "created_at" datetime);
CREATE TABLE "tags" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255));
CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "provider" varchar(255), "uid" varchar(255), "name" varchar(255), "oauth_token" varchar(255), "oauth_secret" varchar(255), "created_at" datetime, "updated_at" datetime, "nickname" varchar(255), "image" varchar(255), "url" varchar(255), "gender" varchar(255), "timezone" varchar(255), "website" varchar(255), "location" varchar(255));
CREATE INDEX "index_emotes_on_created_by" ON "emotes" ("owner_id");
CREATE INDEX "index_emotes_on_popularity" ON "emotes" ("popularity");
CREATE INDEX "index_favorite_emotes_on_user_id" ON "favorite_emotes" ("user_id");
CREATE INDEX "index_recent_emotes_on_user_id" ON "recent_emotes" ("user_id");
CREATE INDEX "index_taggings_on_tag_id" ON "taggings" ("tag_id");
CREATE INDEX "index_taggings_on_taggable_id_and_taggable_type_and_context" ON "taggings" ("taggable_id", "taggable_type", "context");
CREATE UNIQUE INDEX "unique_schema_migrations" ON "schema_migrations" ("version");
INSERT INTO schema_migrations (version) VALUES ('20120114000031');

INSERT INTO schema_migrations (version) VALUES ('20120114011645');

INSERT INTO schema_migrations (version) VALUES ('20120115054446');

INSERT INTO schema_migrations (version) VALUES ('20120117182304');

INSERT INTO schema_migrations (version) VALUES ('20120118025110');

INSERT INTO schema_migrations (version) VALUES ('20120119165536');

INSERT INTO schema_migrations (version) VALUES ('20120127205123');

INSERT INTO schema_migrations (version) VALUES ('20120127205941');

INSERT INTO schema_migrations (version) VALUES ('20120128005719');

INSERT INTO schema_migrations (version) VALUES ('20120128005720');