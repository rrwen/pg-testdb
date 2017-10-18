# pg-testdb

Richard Wen  
rrwen.dev@gmail.com  
  
Module for testing PostgreSQL queries inside isolated databases.

## Test Environment

The tests for [pg-testdb](https://www.npmjs.com/package/pg-testdb) require a local development PostgreSQL database to be setup:

1. Install [PostgreSQL](https://www.postgresql.org/)
2. Ensure [psql](https://www.postgresql.org/docs/current/static/app-psql.html) is available (See [psql Setup](#psql-setup))
3. Create a user named `pgtestdb` with password `pgtestdbpassword`
4. Grant the `pgtestdb` user administrative rights
5. You may wish to delete the `pgtestdb` user after you are done testing

**Step 1.** Use `psql` to create the `pgtestdb` user in your local development PostgreSQL database (replacing `admin` with your admin user name):

```
psql -h localhost -p 5432 -d postgres -U admin -c "CREATE ROLE pgtestdb WITH LOGIN PASSWORD 'pgtestdbpassword' SUPERUSER;"
```

**Step 2.** Run the tests (See [Tests](https://github.com/rrwen/pg-testdb#tests) for more details):

```
npm install
npm test
```

**Optional.** Delete the `pgtestdb` user after testing with [dropuser](https://www.postgresql.org/docs/current/static/app-dropuser.html) (replacing `admin` with your admin user name):

```
dropuser -h localhost -p 5432 -U admin -i -e pgtestdb
```

## psql Setup

The command line tool [psql](https://www.postgresql.org/docs/current/static/app-psql.html) is installed with [PostgreSQL](https://www.postgresql.org/), however it may not be available in the system's environmental variables.  
  
For Windows, you may temporarily add `psql` to your system's environmental variables by including this in your `PATH` variable (Replacing `C:\Program Files\PostgreSQL\9.6\bin` with the path to your PostgreSQL `bin` folder):

```
SET PATH=%PATH%;C:\Program Files\PostgreSQL\9.6\bin
psql --help
```
