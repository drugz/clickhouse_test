import clickhouse from '$lib/clickhouse.js';

export async function get() {
	const ping = await clickhouse.ping();

	if (ping) {
		return {
			status: 200,
			body: {
				message: 'ClickHouse works',
				result: true
			}
		};
	} else {
		return {
			status: 500,
			body: {
				message: 'Could not connect to ClickHouse',
				result: false
			}
		};
	}
}
