# sample comment
ci: lint coverage build

lint:
  # command comment
  tslint -p .

lint-fix:
  tslint -p . --fix

build:
  tsc

test:
  jest

coverage:
  jest --coverage

install:
  npm install

example:
  ls
  ls -l
