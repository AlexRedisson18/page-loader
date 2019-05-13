
install: install-deps

install-deps:
	npm install

run:
	npx babel-node -- src/bin/page-loader.js --output /home/user/page-loader2 https://hexlet.io/courses

build:
	rm -rf dist
	npm run build

test:
	npm test

publish:
	npm publish

lint:
	npx eslint .

.PHONY: test