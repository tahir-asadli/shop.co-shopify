# Define a variable for the Tailwind CSS input file
TAILWIND_INPUT = ./src/tailwind.css

# Define a variable for the Tailwind CSS output file
TAILWIND_OUTPUT = ./assets/tailwind.css

# Define a variable for the Shopify store URL
SHOPIFY_STORE = shopcodemo
SHOPIFY_THEME = Shop.Co

# Default target: if you just run 'make', it will run this target
.PHONY: default
default: watch-tailwind

# Target to watch for changes in Tailwind CSS files and recompile
.PHONY: watch-tailwind
watch-tailwind:
	@echo "Starting Tailwind CSS watch mode..."
	npx @tailwindcss/cli -i $(TAILWIND_INPUT) -o $(TAILWIND_OUTPUT) --watch

# Target to build Tailwind CSS once (without watching)
.PHONY: build-tailwind
build-tailwind:
	@echo "Building Tailwind CSS..."
	npx @tailwindcss/cli -i $(TAILWIND_INPUT) -o $(TAILWIND_OUTPUT)

# Clean target (optional, but good practice)
.PHONY: clean
clean:
	@echo "Cleaning up generated CSS files..."
	rm -f $(TAILWIND_OUTPUT)

# Target to start the Shopify theme development server
.PHONY: dev-theme
dev-theme:
	@echo "Starting Shopify theme development server for store: $(SHOPIFY_STORE)..."
	shopify theme dev --store $(SHOPIFY_STORE)

# Target to start the Shopify theme development server
.PHONY: start
start:
	@echo "Starting development environment..."
	npx concurrently \
		"npx @tailwindcss/cli -i $(TAILWIND_INPUT) -o $(TAILWIND_OUTPUT) --watch" \
		"shopify theme dev --store $(SHOPIFY_STORE) --theme $(SHOPIFY_THEME)"