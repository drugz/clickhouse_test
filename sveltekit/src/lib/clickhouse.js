import { ClickHouseClient } from '@depyronick/clickhouse-client';

const clickhouse = new ClickHouseClient({
    host: '127.0.0.1',
    port: 8123,
    username: 'default',
    database: 'default',
    password: ''
});
export default clickhouse;