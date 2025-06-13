# Makefile for Spiritual Condition Tracker

.PHONY: setup sync-ios build clean

# Setup permissions after git pull
setup:
	chmod +x sync-ios.sh
	chmod +x fix-ios-project.sh

# iOS sync with proper permissions
sync-ios: setup
	./sync-ios.sh

# Build project
build:
	npm run build

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/.cache/

# Help
help:
	@echo "Available commands:"
	@echo "  make setup     - Fix script permissions after git pull"
	@echo "  make sync-ios  - Sync iOS project with proper permissions"
	@echo "  make build     - Build the project"
	@echo "  make clean     - Clean build artifacts"