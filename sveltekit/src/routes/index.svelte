<script context="module">
	// export const prerender = true;
	export const load = async () => {
		const pinging = await fetch('http://localhost:3000/api/ping');
		let body = await pinging.json();
		return {
			props: {
				ping: body.message || ''
			}
		};
	};
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { VirtualScroll } from 'svelte-virtual-scroll-list';

	export let ping: string;
	let status_create_database = '';
	let status_create_tables = '';
	let status_populate = '';
	let products: any[] | undefined = [];
	let products_color: Map<String, String> | undefined = new Map();
	let coupons: any[] | undefined = [];
	let cart_products: any[] | undefined = [];
	let total_cart_cost = 0;
	let total_taxed_cost = 0;
	let discount_value = 0;

	async function getStatus(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			let body = await response.json();
			return body.message;
		} catch (error) {
			console.log(error);
			return 'Sorry. Some error. Try again later';
		}
	}
	async function getData(datatype: string, limit = 10): Promise<Array> {
		try {
			const response = await fetch(`/api/getdata/${datatype}-${limit}`);
			let body = await response.json();
			// console.log(body);
			return body.data;
		} catch (error) {
			console.log(error);
			return ['Sorry. Some error. Try again later'];
		}
	}

	async function createClickhouseTable(): Promise<void> {
		status_create_tables = await getStatus('/api/create_table');
	}

	async function populateClickhouseTable(): Promise<void> {
		status_populate = await getStatus('/api/populate');
		products = await getData('products', 100);
		// set random colors for every product
		products?.map((product) => {
			let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
			products_color.set(product.id, color);
		});
		console.log('products_color', products_color);
		coupons = await getData('coupons', 3);
		discount_value = coupons.reduce((acc, curr) => acc + curr.discount_value, 0);
		cart_products = await getData('cart_products', 100);
		let cart_costs = await getData('total_cart_cost');
		total_cart_cost = cart_costs[0].total_cost;
		total_taxed_cost = cart_costs[0].taxed_cost;
	}
</script>

<h1>
	SvelteKit & ClickHouse DB
	<small>Demo app</small>
</h1>
{#if ping}
	<fieldset id="form">
		<status transition:fade>
			<label for="form">{ping}</label>
		</status>

		<br />
		<button on:click={createClickhouseTable}>Recreate tables</button>
		{#if status_create_tables}
			<status transition:fade>
				{status_create_tables}
			</status>
		{/if}
		<br />
		<button on:click={populateClickhouseTable}>Populate data</button>
		{#if status_populate}
			<status transition:fade>
				{status_populate}
			</status>
		{/if}
	</fieldset>
	<br />
	<lists>
		{#if products.length}
			<list transition:fade>
				<h3 class="headline">🍒 Products</h3>
				<product>
					<p>ID</p>
					<p>Price</p>
					<p>In Discount</p>
				</product>
				<VirtualScroll let:data data={products} key="id">
					<product>
						<ids>{data.id}</ids>
						<p>$ {Math.abs(data.price)}</p>
						<p>{data.no_discount_flag == true ? 'common' : 'discount'}</p>
					</product>
				</VirtualScroll>
			</list>
		{/if}
		{#if coupons.length}
			<list transition:fade>
				<h3 class="headline">
					<span>🎫Coupons</span> <span>Total Discount:{Math.min(discount_value, 100)}%</span>
				</h3>
				<product>
					<p>ID</p>
					<p>Discount value</p>
				</product>
				<VirtualScroll let:data data={coupons} key="id">
					<product>
						<ids>{data.id}</ids>
						<p>{Math.abs(data.discount_value)}%</p>
					</product>
				</VirtualScroll>
			</list>
		{/if}
		{#if cart_products.length}
			<list transition:fade>
				<h3 class="headline">
					<span>🛒 Totally:</span>
					<span>${total_taxed_cost.toFixed(2)}<smal>(with 10% tax)</smal></span>
				</h3>
				<product>
					<p>ID</p>
					<p>Product ID</p>
					<p>Amount</p>
				</product>
				<VirtualScroll let:data data={cart_products} key="id">
					<product>
						<ids>{data.id}</ids>
						<ids>{data.product_id}</ids>
						<p>{Math.abs(data.amount)}</p>
					</product>
				</VirtualScroll>
			</list>
		{/if}
	</lists>
{:else}
	<status transition:fade>No connection to ClickHouse</status>
{/if}

<style>
	h1,
	h2,
	h3,
	button,
	status {
		margin: 10px;
		padding: 10px;
		min-width: 150px;
	}
	product {
		font-size: small;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		border: 1px solid #ccc;
		padding: 10px;
		margin: 10px;
		min-height: 50px;
		border-radius: 5px;
	}
	lists {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		flex-wrap: nowrap;
		align-items: flex-start;
		align-content: center;
	}
	list {
		height: 400px;
		min-width: 30%;
	}
	ids {
		overflow: hidden;
		text-overflow: ellipsis;
		width: 50px;
		white-space: nowrap;
		font-size: x-small;
		transition: all 0.53s ease;
		display: flex;
		min-height: 100%;
		margin: 15px 0;
	}
	ids:hover {
		font-size: xx-small;
		background-color: #fff;
		overflow: overlay;
		text-overflow: unset;
		min-width: 70%;
		white-space: pre-line;
		display: block;
		transition: all 0.5s ease;
	}
	ids:hover + * {
		transition: all 0.3s ease;
		display: none;
		opacity: 0;
	}
</style>
