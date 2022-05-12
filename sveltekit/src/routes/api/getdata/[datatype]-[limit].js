import clickhouse from '$lib/clickhouse.js';

export async function get({ params }) {
    let limit = params.limit || 10;
    let datatype = params.datatype || 'default';

    try {
        // выбираем id первые limit записей
        const handlers = {
            products: async () => { return await clickhouse.queryPromise(`select * from products limit ${limit}`) },
            coupons: async () => { return await clickhouse.queryPromise(`select * from coupons limit ${limit}`) },
            cart_products: async () => { return await clickhouse.queryPromise(`select * from cart_products limit ${limit}`) },
            // total_cart_price: async () => { return await clickhouse.queryPromise(`select * from cart_products limit ${limit}`) },
            total_cart_price: 0,
            default: ["no data"],
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