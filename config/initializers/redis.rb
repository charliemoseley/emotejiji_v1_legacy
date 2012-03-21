require 'redis'
require 'redis/objects'

uri = URI.parse(ENV["REDISTOGO_URL"])

REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
Redis.current = REDIS
