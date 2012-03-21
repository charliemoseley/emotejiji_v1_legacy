require 'redis'
require 'redis/objects'

uri = URI.parse(ENV["REDISTOGO_URL"])
Redis.current = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)