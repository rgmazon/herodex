#!/usr/bin/env bash
set -e

echo "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear

echo "Running migrations..."
php artisan migrate --force

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Starting php-fpm..."
php-fpm -D

echo "Starting nginx..."
nginx -g "daemon off;"
