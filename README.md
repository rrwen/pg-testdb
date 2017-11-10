# pg-testdb

Richard Wen  
rrwen.dev@gmail.com  
  
Module for testing PostgreSQL queries inside isolated databases  

[![npm version](https://badge.fury.io/js/pg-testdb.svg)](https://badge.fury.io/js/pg-testdb)
[![Build Status](https://travis-ci.org/rrwen/pg-testdb.svg?branch=master)](https://travis-ci.org/rrwen/pg-testdb)
[![Coverage Status](https://coveralls.io/repos/github/rrwen/pg-testdb/badge.svg?branch=master)](https://coveralls.io/github/rrwen/pg-testdb?branch=master)
[![npm](https://img.shields.io/npm/dt/pg-testdb.svg)](https://www.npmjs.com/package/pg-testdb)
[![GitHub license](https://img.shields.io/github/license/rrwen/pg-testdb.svg)](https://github.com/rrwen/pg-testdb/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/rrwen/pg-testdb.svg?style=social)](https://twitter.com/intent/tweet?text=%23nodejs%20%23npm%20package%20for%20isolated%20%23postgres%20%23postgresql%20%23pg%20%23database%20%23unittest:%20https%3A%2F%2Fgithub.com%2Frrwen%2Fpg-testdb)

## Install

1. Install [Node.js](https://nodejs.org/en/) (v6.0.0+)
2. Install [pg-testdb](https://www.npmjs.com/package/pg-testdb) via `npm`

```
npm install pg-testdb --save-dev
```

For the latest developer version, see [Developer Install](#developer-install).

## Usage

The easiest way to use this package is to first install the template generator [pg-testdb-template](https://www.npmjs.com/package/pg-testdb-template) globally with `npm`:

```
npm install -g pg-testdb-template

```

Use `pg-testdb-template` to generate a template file named `pg-testdb-template.js` in the current directory for editing:

```
pg-testdb-template
```

The template generated will be similar to the [Full Example](#4-full-example) provided in the [Guide](#guide).  
  
See the [Guide](#guide) for more details.

## Guide

This guide will help you understand how to run tests inside a test PostgreSQL database using `pg-testdb`.  
  
A step-by-step guide, full example, and [tape](https://www.npmjs.com/package/tape) example are provided.

### Step 1. Define Connection Options

First create an object `options` to store the temporary database name and connection details:

* **testdb**: Name of the temporary database to create and test on (must not already exist)
* **messages**: Set to `true` to enable create, drop, and error messages or `false` to disable
* **connection**: Object containing PostgreSQL connection details
* **connection.host**: Host IP address of the PostgreSQL database to connect to
* **connection.port**: Port of the PostgreSQL database to connect to
* **connection.user**: Name of PostgreSQL user with administrative privileges
* **connection.password**: Password for `connection.user`

```javascript
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
options.tests[0] = client => {
  client.connect();
  return client.query('CREATE TABLE created_table (some_text text, some_number numeric);')
    .then(() => {
      // do something after table creation
      console.log('Test table created!');
    })
    .catch(err => {
      // handle table creation error
      console.error('Test table creation failed.');
    });
};
```

#### 2.2 Inserting Values into the Test Table

Insert values `'text data 1', 1), ('text data 2', 2)` into `created_table` after [its creation](#21-creating-a-test-table):

|   some_text   |  some_number  |
| ------------- | ------------- |
| text data  1  |       1       |
| text data  2  |       2       |

```javascript
options.tests[1] = client => {
  return client.query("INSERT INTO created_table VALUES ('text data 1', 1), ('text data 2', 2);")
    .then(() => {
      // do something after insert
      console.log('INSERT test passed!');
    })
    .catch(err => {
      // handle insert error
      console.error('INSERT test failed.');
    });
};
```

#### 2.3 Querying Values from the Test Table

Select all values from `created_table` after [inserting the values](#22-inserting-values-into-the-test-table):

```javascript
options.tests[2] = client => {
  return client.query('SELECT * FROM created_table;')
    .then(res => {
      // do something after select
      console.log('SELECT test passed!');
      console.log(res.rows[0]); // {some_text: 'text data 1', some_number: '1'}
      console.log(res.rows[1]); // {some_text: 'text data 2', some_number: '2'}
    })
    .catch(err => {
      // handle select error
      console.log('SELECT test failed.');
    });
};
```

### 3. Run the Test Queries

Using the `options` object with the connection details defined from [Step 1](#step-1-define-connection-options) and test queries defined from [Step 2](#step-2-define-test-queries), the test queries can then be executed in order.  
  
Running `pgtestdb` will:

1. Create the temporary database [`options.testdb`](#step-1-define-connection-options)
2. Run the [test queries](#step-2-define-test-queries)
3. Drop the temporary database [`options.testdb`](#step-1-define-connection-options) whether tests passed or failed
  
```javascript
var pgtestdb = require('pg-testdb');
pgtestdb(options, (err, res) => {
  // Do something after dropping the test database
  console.log('Testing ended.');
});
```

### 4. Full Example

The code below sets up a temporary test database in PostgreSQL and runs queries in it.  
  
When the code is executed, the following happens:

1. Test database details are defined in the `options` object
2. Test functions are defined for the test database inside the `options.tests` array
3. Test functions in `options.tests` are run in order inside the test database named by `options.testdb`
4. Test database is dropped after the test functions in `options.tests` are run or if an error occurs
5. Steps 1 to 4 are repeated when the code is run again to isolate `options.tests` inside of `options.testdb`

```javascript
var pgtestdb = require('pg-testdb');

// 1. Define test database details
// Enter your Postgres connection details below
// The user should be have super user privileges
// "testdb" is the test database, which should not already exist
var options = {
  testdb: 'pgtestdb', // test db name
  messages: false, // display info
  connection: { // postgres connection details
    host: 'localhost',
    port: 5432,
    user: 'user_name', // should be a super user
    password: 'secret_password'
  }
};

// 2. Define test functions
// Add test functions to execute inside the test database in order
// Each function has access to the client object from pg (https://www.npmjs.com/package/pg)
// Typical usage of the object involves returning "client.query();"
options.tests = [

  // 2.1 Define initial test function
  // The first function should should run "client.connect();" to connect to the test database
  // This function can be used to initialize tables for testing
  client => {
    client.connect(); // IMPORTANT: connect client
    return client.query('CREATE TABLE created_table (some_text text, some_number numeric);')
      .then(() => {
        // Do something after table creation
        console.log('Test table "created_table" created.');
      })
      .catch(err => {
        // Handle table creation error
        console.log('Test table "created_table" creation failed.');
      });
  },

  // 2.2 Define second test function
  // The second function runs after the first one succeeds
  // This function can be used to include data into the table created from the first function
  client => {
    return client.query("INSERT INTO created_table VALUES ('text data 1', 1), ('text data 2', 2);")
      .then(() => {
        // Do something after insert
        console.log('INSERT test passed!');
      })
      .catch(err => {
        // Handle insert error
        console.log('INSERT test failed.');
      });
  },

  // 2.3 Define third test function
  // The third function runs after the second one succeeds
  // This function can be used to query the inserted data from the third function
  client => {
    return client.query('SELECT * FROM created_table;')
      .then(res => {
        // Do something after select query
        console.log('SELECT test passed!');
        console.log(res.rows[0]); // {some_text: 'text data 1', some_number: '1'}
        console.log(res.rows[1]); // {some_text: 'text data 2', some_number: '2'}
      })
      .catch(err => {
        // Handle select query error
        console.log('SELECT test failed.');
      });
  }

  // 2.4 Define additional test functions
  // Any number of functions following the above structure can be defined
  // If a function errors out, the test database will be dropped and the error handled
];

// 3. Run test functions in test database
// Each function in "options.tests" is run in order inside the defined "options.testdb"
// If an error occurs, the error will be handled as defined and the test database dropped
// Re-running this with the defined "options" will recreate the test database and run the test functions inside it
pgtestdb(options, (err, res) => {

  // 4. Drop test database
  // The test database is dropped if all tests succeed or if an error occurs
  // Do something after dropping the test database
  console.log('Test database "pgtestdb" dropped.');
});
```

This example can be generated with [pg-testdb-template](https://www.npmjs.com/package/pg-testdb-template) as shown in [Usage](#usage).

### 5. Example with tape

A testing framework such as [tape](https://www.npmjs.com/package/tape) can be used with `pg-testdb` such that the test functions and execution is inside tape's test function call:

```javascript
var pgtestdb = require('pg-testdb');
var test = require('tape');

// (test_db) Define a test database
var options = {
  testdb: 'pgtestdb', // test db name
  messages: false, // display info
  connection: { // postgres connection details
    host: 'localhost',
    port: 5432,
    user: 'user_name', // should be an admin user
    password: 'secret_password'
  }
};

// (test_tape) Define test functions and run inside tape
test('Tests for tape example', t => {

  // (test_functions) Define test functions
  options.tests = [

    // (test_init) Connect client and create test table
    client => {
      client.connect();
      return client.query('CREATE TABLE created_table (some_text text, some_number numeric);')
        .then(() => {
          t.pass('Test table "created_table" created.');
        })
        .catch(err => {
          t.fail('Test table "created_table" creation failed.');
        });
    },

    // (test_1) Test inserts into test table
    client => {
      return client.query("INSERT INTO created_table VALUES ('text data 1', 1), ('text data 2', 2);")
        .then(() => {
          t.pass('INSERT test passed!');
        })
        .catch(err => {
          t.fail('INSERT test failed.');
        });
    },

    // (test_2) Test select query on test table
    client => {
      return client.query('SELECT * FROM created_table;')
        .then(res => {
          t.pass('SELECT test passed!');
        })
        .catch(err => {
          t.fail('SELECT test failed.');
        });
    }
  ];

  // (test_run) Run the tests
  pgtestdb(options, (err, res) => {
    t.comment('Test database "pgtestdb" dropped.');
  });
});
```

See [tests/test.js](https://github.com/rrwen/pg-testdb/blob/master/tests/test.js) for more examples with tape.

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
4. Setup test environment (See [tests/README.md](https://github.com/rrwen/pg-testdb/blob/master/tests/README.md))
5. Run tests
6. Results are saved to `./tests/log` with each file corresponding to a version tested

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

### Implementation

The [npm](https://www.npmjs.com/) package [pg-testdb](https://www.npmjs.com/package/pg-testdb) was implemented with [pg](https://www.npmjs.com/package/pg) and [pgtools](https://www.npmjs.com/package/pgtools). `pg` was used for creating client connections to PostgreSQL databases in [Node.js](https://nodejs.org/), while `pgtools` was used to temporarily create and drop PostgreSQL databases:

1. Create a temporary database with `pgtools`
2. Create a client connection to the temporary database with `pg`
3. Drop the temporary database with `pgtools`
