.PHONY: up down logs restart status build pull reset-volumes

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

status:
	docker compose ps

build:
	docker compose build --no-cache

pull:
	docker compose pull

reset-volumes:
	docker compose down -v
