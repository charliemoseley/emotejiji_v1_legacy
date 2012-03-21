require 'redis'
require 'redis/objects'

uri = URI.parse(REDIS_URI)
Redis.current = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)