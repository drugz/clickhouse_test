# clickhouse_test
## Test project

### Run docker container with local Clickhouse and SvelteKit
Make copy of .env.example and rename it to .env.
```
docker-compose -f docker-compose.yml up -d
```

Tasks:
1. Create a Clickhouse database (spin a local CH server)

2. Create the following tables (inspired by our Food delivery app):

```
-- products: id, price, no_discount_flag (bool)
-- cart_products: id, product_id, amount
-- coupons: id, discount_value (% of product price)
3. Populate it with some random test data

4. Todo: write an SQL query calculating the final price of a customer's cart, keeping in mind that:

- cart_products may contain both no_discount and discounted products

- total_cart_price = discount_total + no_discount_total + tax (10%)


As a bonus you might make a very simple Svelte front page illustrating this calling CH via HTTP API, but I understand that is probably much more time consuming, so not required.