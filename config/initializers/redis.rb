if Rails.env.development? or Rails.env.test?
  REDIS = Redis.new  # localhost
else
  uri = URI.parse(ENV["REDISTOGO_URL"])
  REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
end