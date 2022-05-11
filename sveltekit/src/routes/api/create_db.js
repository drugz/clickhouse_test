import clickhouse from '$lib/clickhouse.js';

export async function get() {
    try {
        let sendquery = await clickhouse.queryPromise("CREATE DATABASE IF NOT EXISTS default ENGINE = Memory COMMENT 'The test database'");

        console.log(sendquery);

    } catch (e) {
        console.log(e);
        return {
            status: 500,
            body: {
                message: "could not create database",
                result: false
            }
        }
    }

    return {
        status: 200,
        body: {
            message: "database is created",
            result: true
        }
    }
}
