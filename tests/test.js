// Richard Wen
// rrwen.dev@gmail.com
// Usage and example testing

var fs = require('fs');
var moment = require('moment');
var pgtestdb = require('../index.js');
var test = require('tape');

// (package_info) Get package metadata
var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var testedPackages = [];
for (var k in json.dependencies) {
  testedPackages.push(k + ' (' + json.dependencies[k] + ')');
}
var devPackages = [];
for (var k in json.devDependencies) {
  devPackages.push(k + ' (' + json.devDependencies[k] + ')');
}

// (test_database) Database connection details
var options = {
  testdb: 'pgtestdb',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'pgtestdb',
    password: 'pgtestdbpassword'
  }
};

// (test_options_exists) Existing database
var optionsExists = {
  testdb: 'postgres',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'pgtestdb',
    password: 'pgtestdbpassword'
  }
};

// (test_empty_tests) Empty tests
var optionsEmptyTests = {
  testdb: 'pgtestdb2',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'pgtestdb',
    password: 'pgtestdbpassword'
  }
};

// (test_single_tests) Empty tests
var optionsSingleTests = {
  testdb: 'pgtestdb3',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'pgtestdb',
    password: 'pgtestdbpassword'
  },
  tests: [
    client => {
      client.connect();
      return client.query('CREATE TABLE created_table (some_text text, some_number numeric);')
        .catch(err => {
          console.error(err);
        });
    },
  ]
};

// (test_file) Pipe tests to file and output
if (!fs.existsSync('./tests/log')){
    fs.mkdirSync('./tests/log');
}
var testFile = './tests/log/test_' + json.version.split('.').join('_') + '.txt';
test.createStream().pipe(fs.createWriteStream(testFile));
test.createStream().pipe(process.stdout);

// (test_run) Run tests
test('Tests for ' + json.name + ' (' + json.version + ')', t => {
  t.comment('Node.js (' + process.version + ')');
  t.comment('Description: ' + json.description);
  t.comment('Date: ' + moment().format('YYYY-MM-DD hh:mm:ss'));
  t.comment('Dependencies: ' + testedPackages.join(', '));
  t.comment('Developer: ' + devPackages.join(', '));
  
  // (test_functions) Tests to perform
  options.tests = [
    
    // (a_test_create) Create table
    client => {
      client.connect();
      t.comment('BEGIN');
      t.comment('(A) tests on usage examples');
      return client.query('CREATE TABLE created_table (some_text text, some_number numeric);')
        .then(() => {
          t.pass('(A) create table');
        })
        .catch(err => {
          t.fail('(A) create table: ' + err.message);
        });
    },

    // (a_test_insert) Insert to table
    client => {
      return client.query("INSERT INTO created_table VALUES ('text data 1', 1), ('text data 2', 2);")
        .then(res => {
          t.pass('(A) insert into table');
        })
        .catch(err => {
          t.fail('(A) insert into table: ' + err.message);
        });
    },

    // (a_test_select) Select from table
    client => {
      return client.query('SELECT * FROM created_table;')
        .then(res => {
          var actual = res.rows;
          var expected = [{some_text: 'text data 1', some_number: '1'}, {some_text: 'text data 2', some_number: '2'}];
          t.deepEquals(actual, expected, '(A) select from table');
        })
        .catch(err => {
          t.fail('(A) select from table: ' + err.message);
        });
    },

    // (a_test_update) Update table
    client => {
      return client.query("UPDATE created_table SET some_text = 'text data 3', some_number = 3 WHERE some_text = 'text data 2' OR some_number = 2;")
        .then(() => {
          t.pass('(A) update table');
        })
        .catch(err => {
          t.fail('(A) update table: ' + err.message);
        });
    },

    // (a_test_delete) Delete from table
    client => {
      return client.query("DELETE FROM created_table WHERE some_text = 'text data 1' AND some_number = 1;")
        .then(res => {
          t.pass('(A) delete from table');
        })
        .catch(err => {
          t.fail('(A) delete from table: ' + err.message);
        });
    },

    // (a_test_view) Create view
    client => {
      return client.query("CREATE VIEW created_view AS SELECT some_number FROM created_table;")
        .then(() => {
          t.pass('(A) create view');
        })
        .catch(err => {
          t.fail('(A) create view: ' + err.message);
        });
    },

    // (a_test_select_view) Select from view
    client => {
      return client.query("SELECT * FROM created_view;")
        .then(res => {
          var actual = res.rows;
          var expected = [{some_number: '3'}];
          t.deepEquals(actual, expected, '(A) select from view');
        })
        .catch(err => {
          t.fail('(A) select from view: ' + err.message);
        });
    },

    // (a_test_drop_view) Drop view
    client => {
      return client.query("DROP VIEW created_view;")
        .then(() => {
          t.pass('(A) drop view');
        })
        .catch(err => {
          t.fail('(A) drop view: ' + err.message);
        });
    },

    // (a_test_drop) Drop table
    client => {
      return client.query('DROP TABLE created_table;')
        .then(() => {
          t.pass('(A) drop table');
        })
        .catch(err => {
          t.fail('(A) drop table: ' + err.message);
        });
    },

    // (a_test_select_nonexist) Select from non-existing table
    client => {
      return client.query('SELECT * FROM nonexist;')
        .then(() => {
          t.fail("(A) select nonexist: Client should not be able to query table 'nonexist'");
        })
        .catch(() => {
          t.pass("(A) select nonexist");
        });
    },

    // (a_test_invalid) Invalid query
    client => {
      return client.query('some invalid query')
        .then(() => {
          t.fail("(A) invalid query: Query 'some invalid query' should not be valid");
        })
        .catch(() => {
          t.pass("(A) invalid query");
        });
    },

    // (b_test_users) Create users table
    client => {
      t.comment('(B) Tests based on node pg client query guide by Brian Carlson: https://node-postgres.com/features/queries');
      return client.query('CREATE TABLE users (name text, email text);')
        .then(() => {
          t.pass('(B) create users table');
        })
        .catch(err => {
          t.fail('(B) create users table: ' + err.message);
        });
    },

    // (b_test_userids) Create userids table
    client => {
      return client.query('CREATE TABLE userids (id numeric);INSERT INTO userids VALUES (1);')
        .then(() => {
          t.pass('(B) create userids table');
        })
        .catch(err => {
          t.fail('(B) create userids table: ' + err.message);
        });
    },

    // (b_test_some_table) Create some_table table
    client => {
      return client.query('CREATE TABLE some_table (some_text text, some_number numeric);')
        .then(() => {
          t.pass('(B) create some_table table');
        })
        .catch(err => {
          t.fail('(B) create some_table table: ' + err.message);
        });
    },

    // (c_test_insert_some_table) Insert into some_table table
    client => {
      return client.query("INSERT INTO some_table VALUES ('text data', 1);")
        .then(() => {
          t.pass('(B) insert into some_table table');
        })
        .catch(err => {
          t.fail('(B) insert into some_table table: ' + err.message);
        });
    },

    // (b_test_pg1) Text only
    client => {
      return client.query('SELECT NOW() as now')
        .then(res => {
          t.pass('(B) text only');
        })
        .catch(err => {
          t.fail('(B) text only: ' + err.message);
        });
    },

    // (b_test_pg2) Parameterized query
    client => {
      var text = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *';
      var values = ['brianc', 'brian.m.carlson@gmail.com'];
      return client.query(text, values)
        .then(() => {
          t.pass('(B) parameterized query');
        })
        .catch(err => {
          t.fail('(B) parameterized query: ' + err.message);
        });
    },

    // (b_test_pg3) Query config object
    client => {
      var query = {
        text: 'INSERT INTO users(name, email) VALUES($1, $2)',
        values: ['brianc', 'brian.m.carlson@gmail.com'],
      };
      return client.query(query)
        .then(() => {
          t.pass('(B) query config object');
        })
        .catch(err => {
          t.fail('(B) query config object: ' + err.message);
        });
    },

    // (b_test_pg4) Prepared statements
    client => {
      var query = {
        name: 'fetch-user',
        text: 'SELECT * FROM userids WHERE id = $1',
        values: [1]
      };
      return client.query(query)
        .then(res => {
          var actual = res.rows;
          var expected = [{id: '1'}];
          t.deepEquals(actual, expected, '(B) prepared statements')
        })
        .catch(err => {
          t.fail('(B) prepared statements: ' + err.message);
        });
    },

    // (b_test_pg5) Row mode
    client => {
      var query = {
        text: 'SELECT $1::text as first_name, (select $2::text as last_name)',
        values: ['Brian', 'Carlson'],
        rowMode: 'array',
      };
      return client.query(query)
        .then(res => {
          
          // (b_test_pg5_1) Test row mode fields name and format
          var actual1 = [
            {
              name: res.fields[0].name,
              format: res.fields[0].format
            },
            {
              name: res.fields[1].name,
              format: res.fields[1].format
            }
          ];
          var expected1 =[
            {
              name: 'first_name',
              format: 'text'
            },
            {
              name: 'last_name',
              format: 'text'
            }
          ];
          t.deepEquals(actual1, expected1, '(B) row mode fields');

          // (b_test_pg5_2) Test row mode rows
          var actual2 = res.rows;
          var expected2 = [['Brian', 'Carlson']];
          t.deepEquals(actual2, expected2, '(B) row mode rows');
        })
        .catch(err => {
          t.fail('(B) row mode: ' + err.message);
        });
    },

    // (b_test_pg6) Types
    client => {
      var query = {
        text: 'SELECT * from some_table',
        types: {
          getTypeParser: () => (val) => val
        }
      };
      return client.query(query)
        .then(res => {

          // (b_test_pg6_1) Test type fields name and format
          var actual1 = [
            {
              name: res.fields[0].name,
              format: res.fields[0].format
            },
            {
              name: res.fields[1].name,
              format: res.fields[1].format
            }
          ];
          var expected1 =[
            {
              name: 'some_text',
              format: 'text'
            },
            {
              name: 'some_number',
              format: 'text'
            }
          ];
          t.deepEquals(actual1, expected1, '(B) types fields');

          // (b_test_pg6_2) Test type rows
          var actual2 = res.rows;
          var expected2 = [{some_text: 'text data', some_number: '1'}];
          t.deepEquals(actual2, expected2, '(B) types rows');
        })
        .catch(err => {
          t.fail('(B) types: ' + err.message);
        })
    }
  ];

  // (test_exists) Test existing database
  pgtestdb(optionsExists, (err, res) => {
    if (err) {
      t.pass('(MAIN) Database exists');
    } else {
      t.fail('(MAIN) Database exists: ' + err.message);
    };
  });

  // (test_empty) Test empty options
  pgtestdb(undefined, (err, res) => {
    t.pass('(MAIN) Empty options');
  });

  // (test_empty_tests) Test empty tests
  pgtestdb(optionsEmptyTests, (err, res) => {
    if (err) {
      t.fail('(MAIN) Empty tests: ' + err.message);
    } else {
      t.pass('(MAIN) Empty tests');
    }
  });

  // (test_single_tests) Test single tests
  pgtestdb(optionsSingleTests, (err, res) => {
    if (err) {
      t.fail('(MAIN) Single tests: ' + err.message);
    } else {
      t.pass('(MAIN) Single tests');
    }
  });

  // (test_db) Run client tests on database
  pgtestdb(options, (err, res) => {
    if (!err) {
      t.pass('(MAIN) Drop database');
      t.comment('END');
    } else {
      t.fail('(MAIN) Drop database: ' + err.message);
    };
    t.end();
  });
});
