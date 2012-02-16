Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'tw0SzFDfIIljB4xiou1RSw', 'qdaHJkwY1d4saMmZzpzpVqC5U3gZzw7PqZEm7ZhE'
  provider :facebook, '177489172300244', 'fd2fb6fd55742bfea7ffe9e2fd423072', 
           :scope => 'user_about_me,offline_access,publish_stream'
end