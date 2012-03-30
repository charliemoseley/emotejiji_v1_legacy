if Rails.env.development? or Rails.env.test?
  # REDIS = Redis.new  # localhost
  Redis.current = Redis.new  # localhost
else
  # REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
  uri = URI.parse(ENV["REDISTOGO_URL"])
  Redis.current = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
end

REDIS = Redis.current