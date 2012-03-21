# require 'redis'
# require 'redis/objects'


uri = URI.parse("redis://redistogo:7138590ae359496101b83508d065a466@cod.redistogo.com:9935")
Redis.current = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)

# if url = ENV['REDISTOGO_URL']
#   uri = URI.parse(url)
#   Redis.current = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
# elsif Rails.env.development? or Rails.env.test?  # or check ENV['RACK_ENV']
#   Redis.current = Redis.new  # localhost
# else
#   # supposed to have a server
#   raise "Missing redis server - please set REDISTOGO_URL env var"
# end