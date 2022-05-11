import clickhouse from '$lib/clickhouse.js';

export async function get() {
    // -- products: id, price, no_discount_flag (bool)
    // -- cart_products: id, product_id, amount
    // -- coupons: id, discount_value (% of product price)
    const queries = [
        "CREATE TABLE IF NOT EXISTS products (id UUID NOT NULL, price Decimal(9,2), nodiscount_flag UInt8) ENGINE = Memory",
        "CREATE TABLE IF NOT EXISTS cart_products (id UUID NOT NULL, product_id UInt64, amount Int16) ENGINE = Memory",
        "CREATE TABLE IF NOT EXISTS coupons (id UUID NOT NULL, discount_value Decimal(3,2)) ENGINE = Memory",
    ];
    try {
        const promises = await (Promise.all(queries.map(query => clickhouse.queryPromise(query))));
        console.log(promises);
    } catch (e) {
        console.log(e);
        return {
            status: 500,
            body: {
                message: "could not create table",
                result: false
            }
        }
    }

    return {
        status: 200,
        body: {
            message: "tables created",
            result: true
        }
    }
}