# pg-testdb

Richard Wen  
rrwen.dev@gmail.com  
  
Module for testing PostgreSQL queries inside isolated databases

## Install

1. Install [Node.js](https://nodejs.org/en/)
2. Install [pg-testdb](https://www.npmjs.com/package/pg-testdb) via `npm`

```
npm install pg-testdb
```

For the latest developer version, see [Developer Install](#developer-install).

## Developer Notes

### Developer Install

Install the latest developer version with `npm` from github:

```
npm install git+https://github.com/rrwen/pg-testdb
```
  
Install from `git` cloned source:

1. Ensure [git](https://git-scm.com/) is installed
2. Clone into current path
3. Install via `npm`

```
git clone https://github.com/rrwen/pg-testdb
cd pg-testdb
npm install
```

### Tests

1. Clone into current path `git clone https://github.com/rrwen/pg-testdb`
2. Enter into folder `cd pg-testdb`
3. Ensure [tape](https://www.npmjs.com/package/tape) and [moment](https://www.npmjs.com/package/moment) are available
4. Run tests
5. Results are saved to `./tests/log` with each file corresponding to a version tested

```
npm install
npm test
```

### Upload to Github

1. Ensure [git](https://git-scm.com/) is installed
2. Inside the `pg-testdb` folder, add all files and commit changes
3. Push to github

```
git add .
git commit -a -m "Generic update"
git push
```
