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

clean:
  rm -f jest.setup.{js,d.ts,js.map}
  rm -f src/*.{js,d.ts,js.map}

example:
  ls
  ls -l
