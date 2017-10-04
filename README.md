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

## Usage

### Step 1. Define Connection Options

First create an object `options` to store the temporary database name and connection details:

* **testdb**: Name of the temporary database to create and test on (must not already exist)
* **messages**: Set to `true` to enable create, drop, and error messages or `false` to disable
* **connection**: Object containing PostgreSQL connection details
* **connection.host**: Host IP address of the PostgreSQL database to connect to
* **connection.port**: Port of the PostgreSQL database to connect to
* **connection.user**: Name of PostgreSQL user with administrative privileges
* **connection.password**: Password for `connection.user`

```
var options = {
  testdb: 'pgtestdb',
  messages: false,
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'user_name',
    password: 'secret_password'
  }
};
```

### Step 2. Define Test Queries

Define an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) `[]` of test queries to be run:

* Each test query in the array is a callback function that consumes a [client](https://node-postgres.com/api/client) object from the [pg](https://www.npmjs.com/package/pg) package
* Test queries in the array are run one after another (in order)

```javascript
options.tests = [];
```

#### 2.1 Creating a Test Table

Initialize your tests by connecting the [client](https://node-postgres.com/api/client) object and creating a table named `created_table` with columns `some_text` and `some_number`:

|   some_text   |  some_number  |
| ------------- | ------------- |
|               |               |

```javascript
options.tests.push(

 client => {
  client.connect();
  return client.query('CREATE TABLE created_table (some_text text, some_number numeric);')
    .then(() => {
      // do something after table creation
    })
    .catch(err => {
      // handle table creation error
    });
  }
  
);

```

#### 2.2 Inserting Values into the Test Table

Insert values `'text data 1', 1), ('text data 2', 2)` into `created_table` after [its creation](#21-creating-a-test-table):

|   some_text   |  some_number  |
| ------------- | ------------- |
| text data  1  |       1       |
| text data  2  |       2       |

```javascript
options.tests.push(

  client => {
    return client.query("INSERT INTO created_table VALUES ('text data 1', 1), ('text data 2', 2);")
      .then(() => {
        // do something after insert
      })
      .catch(err => {
        // handle insert error
      });
  }
  
);

```

#### 2.3 Querying Values from the Test Table

Select all values from `created_table` after (inserting the values)[#22-inserting-values-into-the-test-table]:

```javascript
options.tests.push(

  client => {
    return client.query('SELECT * FROM created_table;')
      .then(res => {
        // do something after select
        console.log(res.rows[0]); // {some_text: 'text data 1', some_number: '1'}
        console.log(res.rows[1]); // {some_text: 'text data 2', some_number: '2'}
      })
      .catch(err => {
        // handle select error
      });
  }
  
);
```

### 3. Run the Test Queries

Using the `options` object with the connection details defined from [Step 1](#step-1-define-connection-options) and test queries defined from [Step 2](#step-2-define-test-queries), the test queries can then be executed in order.  
  
Running `pgtestdb` will:

1. Create the temporary database [`options.testdb`](#step-1-define-connection-options)
2. Run the [test queries](#step-2-define-test-queries)
3. Drop the temporary database [`options.testdb`](#step-1-define-connection-options) after
  
```javascript
var pgtestdb = require('pg-testdb');
pgtestdb(options, (err, res) => {
  // Do something after dropping the temporary test database
});
```

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

### Upload to npm

1. Update the version in `package.json`
2. Run tests and check for OK status
3. Login to npm
4. Publish to npm

```
npm test
npm login
npm publish
```
  
