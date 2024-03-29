Emotejiji::Application.routes.draw do
  match "/admin" => 'admin#index'

  # Omniauth routes
  match '/login' => 'sessions#new'
  match '/auth/:provider/callback' => 'sessions#create'
  match '/signout' => 'sessions#destroy', :as => :signout
  
  # Pages Controller
  match '/about' => 'pages#about', :as => :about
  
  # Emotes Controller
  match '/profile'       => 'emotes#profile',   :as => :profile
  match '/recent'        => 'emotes#recent',    :as => :recent
  match '/favorites'     => 'emotes#favorites', :as => :favorites
  
  match '/emotes/record_recent'    => 'emotes#record_recent'
  match '/emotes/record_favorite'  => 'emotes#record_favorite'
  match '/emotes/search'           => 'emotes#tag_search'
  match '/emotes/json'             => 'emotes#json'

  resources :subscribe
  
  # Autocomplete routes
  resources :emotes do
    get :autocomplete_tag_name, :on => :collection
  end
  

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with 'root'
  # just remember to delete public/index.html.
  root :to => 'emotes#index'

  # See how all your routes lay out with 'rake routes'

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
