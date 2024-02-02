const pg = require("pg");
const fs = require("fs");
const path = require("path");
const sqlPath = path.join(process.cwd(), "db", "seed.sql");

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;

const pool = new pg.Pool({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  db: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

const seed = fs.readFileSync(sqlPath).toString();
pool.query(seed, (err, res) => {
  if (err?.code === "ECONNREFUSED") {
    throw new Error(`Connection Refused by Database Host`);
  } else {
    console.log(err?.message);
  }
  console.log(`DATABASE CONNECTED | Seeding done`);
});

module.exports = pool;
