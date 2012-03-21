require 'redis'
require 'redis/objects'

redis_uri = Rails.env.production? ? ENV["REDISTOGO_URL"] : 'redis://localhost:6379' 
Rails.logger.info 'Errno::[' + ENV["REDISTOGO_URL"] + ']'
Rails.logger.info 'Errno::URI[' + redis_uri + ']'
uri = URI.parse(redis_uri)

Redis.current = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)