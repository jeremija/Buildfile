# sample comment
ci: lint test build

lint:
  # command comment
  tslint -p .

lint-fix:
  tslint -p . --fix

build:
  tsc

test:
  jest

install:
  npm install

example:
  ls
  ls -l
