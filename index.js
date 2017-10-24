// Richard Wen
// rrwen.dev@gmail.com

const { Client } = require('pg')

var pgtools = require('pgtools');

module.exports = function(options, callback) {
	var options = options || {};

	// (defaults_testdb) Default testdb options
	options.tests = options.tests || [];
	options.testdb = options.testdb || process.env.PGTESTDB || 'testdb';
	options.messages = typeof options.messages !== 'undefined' ? options.messages : true;

	// (defaults_connection) Default postgres connection options
	options.connection = options.connection || process.env.PGCONNECTION || {};
	if (Object.prototype.toString.call(options.connection) == '[object Object]') {
		options.connection.host = options.connection.host || process.env.PGHOST || 'localhost';
		options.connection.port = options.connection.port || process.env.PGPORT || 5432;
		options.connection.user = options.connection.user || process.env.PGUSER || 'postgres';
		options.connection.password = options.connection.password || process.env.PGPASSWORD || '';
	}

	// (test) Test a node function inside a database
	pgtools.createdb(options.connection, options.testdb, function (err, res) {

		// (test_create_error) Exit on database creation error
		if (err) {
			callback(err);
		}
		if (!err && options.messages) {
			console.log('CREATE ' + options.testdb);
		}

		// (test_client) Create pg client
		const client = new Client({
			host: options.connection.host,
			port: options.connection.port,
			database: options.testdb,
			user: options.connection.user,
			password: options.connection.password
		});

		// (test_call) Call tests functions in order
		if (options.tests.length > 0) {
			var chain = options.tests.shift()(client);

			// (test_call_chain) Chain promises in order
			if (options.tests.length > 1) {
				options.tests.forEach(function(test) {
					chain = chain.then(() => {
						return test(client);
					});
				});
			}

			// (test_call_end) Drop database after tests
			chain
				.catch(err => {
					if (options.messages) {
						console.error('Error: ' + err.message);
					}
				})
				.then(() => {
					client.end();
					pgtools.dropdb(options.connection, options.testdb, callback);
				});
		} else {
			pgtools.dropdb(options.connection, options.testdb, callback);
		};
	});
};
