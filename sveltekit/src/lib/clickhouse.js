import { ClickHouseClient } from '@depyronick/clickhouse-client';
// import { config } from "dotenv";
// config({ path: process.env });

// dotenv.config();
console.log("process.env:", process.env);
console.log("process.env.CLICKHOUSE_HOST:", process.env.CLICKHOUSE_HOST);
const clickhouse = new ClickHouseClient({
	host: process.env.CLICKHOUSE_HOST||'127.0.0.1',
	port: 8123,
	username: 'default',
	database: 'default',
	password: ''
});
export default clickhouse;