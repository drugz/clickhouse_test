import clickhouse from '$lib/clickhouse.js';

export async function get({ params }) {
    let limit = params.limit || 10;
    let datatype = params.datatype || 'default';

    try {
        // выбираем id первые limit записей
        const handlers = {
			products: async () => {
				return await clickhouse.queryPromise(`select * from products limit ${limit}`);
			},
			coupons: async () => {
				// get some limit number of coupones from randomed table, which less than 30%
				return await clickhouse.queryPromise(`SELECT coupons.id, min2(abs(coupons.discount_value)/10,30) AS discount_value FROM coupons limit ${limit}`);
			},
        };
        let data = await handlers[datatype]();
        return {
            status: 200,
            body: {
                data: data || handlers.default,
                result: true
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: 500,
            body: {
                message: "error inserting into cart_products",
                result: false
            }
        }
    }
}