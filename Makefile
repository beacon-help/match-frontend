list:
	@grep -E '^[a-zA-Z0-9_ -]+:' $(firstword $(MAKEFILE_LIST)) | sed 's/:$$//'

test:
	pnpm run test

format:
	pnpm run format

up:
	pnpm run dev -- --open
