SHELL = /bin/sh
include .env

up:
	docker network create -d bridge "${DB_NETWORK_NAME}" || echo 'Network already exists'
	docker-compose up -d
	sleep 10
	docker-compose run --rm wordpress_cli wp --allow-root core install --url=http://localhost --title=${WP_PROJECT_NAME} --admin_user=${WP_USER_NAME} --admin_email=${WP_USER_EMAIL} --admin_password=${WP_USER_PASSWORD}
	docker-compose run --rm wordpress_cli wp --allow-root user update ${WP_USER_NAME} --user_pass=${WP_USER_PASSWORD}
	docker-compose run --rm wordpress_cli wp --allow-root plugin install woocommerce --activate

down: 
	docker-compose down -v