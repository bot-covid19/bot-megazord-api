SHELL := /bin/bash

.PHONY: up
up:
	docker-compose up

.PHONY: down
down:
	docker-compose down

.PHONY: clear
clear:
	docker-compose down -v

.PHONY: seed
seed:
	docker-compose -f docker-compose.yml -f docker-compose.mongo.yml run seed
