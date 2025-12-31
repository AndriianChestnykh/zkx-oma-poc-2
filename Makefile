.PHONY: help start stop restart reset deploy logs status db-reset test test-watch clean setup dev

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Start all infrastructure (database + blockchain)
	@docker compose -f docker/docker-compose.yml up -d
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Infrastructure started! Check status with: make status"

stop: ## Stop all infrastructure
	@docker compose -f docker/docker-compose.yml down

restart: ## Restart all infrastructure (keeps data)
	@docker compose -f docker/docker-compose.yml restart

reset: ## Complete reset (destroys all data, redeploys contracts)
	@./scripts/reset-all.sh

deploy: ## Deploy smart contracts to Anvil
	@./scripts/deploy-contracts.sh

logs: ## Follow logs from all containers
	@docker compose -f docker/docker-compose.yml logs -f

status: ## Show status of all containers
	@docker compose -f docker/docker-compose.yml ps

db-reset: ## Reset database only (keep blockchain state)
	@./scripts/reset-db.sh

test: ## Run all tests (Next.js + Foundry)
	npm test
	cd contracts && forge test

test-watch: ## Run tests in watch mode
	npm run test:watch

clean: ## Remove all containers, volumes, and build artifacts
	@docker compose -f docker/docker-compose.yml down -v
	@rm -rf node_modules
	@rm -rf contracts/out contracts/cache
	@echo "Cleaned! Run 'make setup' to reinitialize."

setup: ## Initial project setup
	@./scripts/setup-dev.sh

dev: ## Start Next.js dev server
	@npm run dev
