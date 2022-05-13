import clickhouse from '$lib/clickhouse.js';

export async function get({ params }) {
	let limit = params.limit || 10;
	let datatype = params.datatype || 'default';

	try {
		const handlers = {
			products: async () => {
				return clickhouse.queryPromise(`select * from products limit ${limit}`);
			},
			coupons: async () => {
				// get some limit number of coupones from randomed table, which less than 30%
				return clickhouse.queryPromise(`SELECT coupons.id, min2(abs(coupons.discount_value)/10,30) AS discount_value FROM coupons limit ${limit}`);
			},
			cart_products: async () => {
				return clickhouse.queryPromise(`SELECT cart_products.id, cart_products.amount, cart_products.product_id, products.price, products.no_discount_flag FROM cart_products INNER JOIN (SELECT * FROM products limit 1000) AS products ON (cart_products.product_id = products.id)`);
			},
			total_cart_cost: async () => {
				// WITH (SELECT min2(SUM(discount),100) AS discount FROM (SELECT min2(abs(coupons.discount_value)/10,30) AS discount FROM coupons limit 5 ) as c) AS discount 
				// SELECT
				// --p.id,
				// --p.price,
				// --cart.amount,
				// --p.price*cart.amount as val,
				// --no_discount_flag,
				// --no_discount_flag!=true?0:discount AS "discount %",
				// SUM(no_discount_flag!=true ? p.price*cart.amount : p.price*cart.amount*0.01*(100-discount)) AS total_cost
				// total_cost*1.1 as taxed_cost 
				// FROM (SELECT * FROM cart_products) AS cart 
				// INNER JOIN 
				// (SELECT * FROM products limit 100) AS p ON (p.id=cart.product_id)
				return clickhouse.queryPromise(`WITH (SELECT min2(SUM(d),100) AS d FROM (SELECT min2(abs(coupons.discount_value)/10,30) AS d FROM coupons limit ${limit} ) as c) AS discount SELECT SUM(no_discount_flag!=true ? p.price*cart.amount : p.price*cart.amount*0.01*(100-discount)) AS total_cost, total_cost*1.1 as taxed_cost FROM (SELECT * FROM cart_products) AS cart INNER JOIN (SELECT * FROM products limit 100) AS p ON (p.id=cart.product_id)`)
			},
			default: ['no data']
		};
		let data = await handlers[datatype]();
		return {
			status: 200,
			body: {
				data: data || handlers.default,
				result: true
			}
		};
	} catch (e) {
		console.log(e);
		return {
			status: 500,
			body: {
				message: 'error inserting into cart_products',
				result: false
			}
		};
	}
}
