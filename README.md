# Step 01
composer install

# Step 02
npm install

# Step 03 / Add new table or column
php artisan migrate

# Step 04 / Run Seeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=UserSeeder

php artisan jwt:secret

# Running project
php artisan serve
npm run dev

# If we got error "No application encryption key has been specified."
php artisan key:generate


# Delele Data All Table
php artisan migrate:refresh

# Delete Data One Table
php artisan migrate:refresh --path=""

# clear cache, route, config
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan route:cache
php artisan config:cache

# Run the queue worker:
php artisan queue:work


php artisan make:model YourModelName -mcr


# jetstream
composer require laravel/jetstream
php artisan jetstream:install inertia
composer require spatie/laravel-permission

# dependencies
npm install inertiajs/react
npm install axios
npm install react-dom

# tailwind
npm install tailwindcss @tailwindcss/vite
# to vite.config
import tailwindcss from '@tailwindcss/vite'
# put in plugin
tailwindcss(),

# in css
@import "tailwindcss";
