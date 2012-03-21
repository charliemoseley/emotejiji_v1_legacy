require 'redis'
require 'redis/objects'

redis_uri = Rails.env.production? ? ENV["REDISTOGO_URL"] : 'redis://localhost:6379' 
uri = URI.parse(redis_uri)

REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
Redis.current = REDIS
