import clickhouse from '$lib/clickhouse.js';
import { v4 as uuidv4 } from 'uuid';

export async function get() {
	// 3. Populate it with some random test data ENGINE = GenerateRandom(1, 5, 3)
	// выбираем id первых 10 продуктов
	await clickhouse.queryPromise(`TRUNCATE TABLE IF EXISTS cart_products`);
	const products = await clickhouse.queryPromise(`select id from products limit 100`);
	// составляем список из рандомных товаров
	const cart = [];
	products.forEach((product) => {
		let rand = Math.random();
		if (rand > 0.5) {
			cart.push({
				id: uuidv4(),
				product_id: product.id,
				amount: Math.floor(rand * 10)
			});
		}
	});
	try {
		// добавляем в корзину рандомное количество продуктов
		await clickhouse.insertPromise('cart_products', cart);
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
	return {
		status: 200,
		body: {
			message: 'populated',
			result: true
		}
	};
}
