<script context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { VirtualScroll } from 'svelte-virtual-scroll-list';

	let ping: string;
	let ping_result: boolean;
	let commas = '';
	let ping_timer = setInterval(() => {
		if (commas.length > 10 || commas.length == 0) {
			getStatus('http://localhost:3000/api/ping').then((res: any) => {
				ping = res.message;
				ping_result = res.result;
				commas = '';
				if (ping_result) {
					clearInterval(ping_timer);
				}
			});
		} else {
			commas += '.';
		}
	}, 1000);

	let status_create_tables = '';
	let status_populate = '';
	let products: any[] = [];
	let products_color: Map<String, String> = new Map();
	let coupons: any[] = [];
	let cart_products: any[] | undefined = [];
	let total_cart_cost = 0;
	let total_taxed_cost = 0;
	let discount_value = 0;

	async function getStatus(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			let data = await response.json();
			return data;
		} catch (error) {
			console.log(error);
			return 'Sorry. Some error. Try again later';
		}
	}
	async function getData(datatype: string, limit = 10): Promise<any> {
		try {
			const response = await fetch(`/api/getdata/${datatype}-${limit}`);
			let data = await response.json();
			return data.data;
		} catch (error) {
			console.log(error);
			return ['Sorry. Some error. Try again later'];
		}
	}

	async function createClickhouseTable(): Promise<void> {
		let data: any = await getStatus('/api/create_table');
		status_create_tables = data.message;
	}

	async function populateClickhouseTable(): Promise<void> {
		let data: any = await getStatus('/api/populate');
		status_populate = data.message;
		products = await getData('products', 100);
		// set random colors for every product
		products?.map((product) => {
			let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
			products_color.set(product.id, color);
		});
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
{#if ping_result}
	<div id="form">
		<status>
			<svg width="10" height="10">
				<circle cx="50%" cy="50%" r="5" fill="lightgreen" />
			</svg>
			<a href="http://localhost:8123/play" target="_blank" transition:fade>
				{ping}
			</a>
		</status>
		<br />
		<button on:click={createClickhouseTable}>Recreate tables</button>
		{#if status_create_tables}
			<status transition:fade>
				{status_create_tables}
			</status>
		{/if}
		<br />
		<button on:click={populateClickhouseTable}>Refill cart</button>
		{#if status_populate}
			<status transition:fade>
				{status_populate}
			</status>
		{/if}
	</div>
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
					<product class:discount_flag={!data.no_discount_flag}>
						<ids>
							<svg width="10" height="10">
								<circle cx="50%" cy="50%" r="5" fill={products_color?.get(data.id)} />
							</svg>
							{data.id}
						</ids>
						<p>${Math.abs(data.price)}</p>
						<p>{data.no_discount_flag == true ? 'standart' : 'discount'}</p>
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
					<!-- <p>ID</p> -->
					<p>{cart_products.length} Products</p>
					<p>Amount</p>
					<p>Total cost: <br />${total_cart_cost.toFixed(2)}</p>
				</product>
				<VirtualScroll let:data data={cart_products} key="id">
					<product class:discount_flag={!data.no_discount_flag}>
						<!-- <ids>{data.id}</ids> -->
						<ids>
							<svg width="10" height="10">
								<circle cx="50%" cy="50%" r="5" fill={products_color?.get(data.product_id)} />
							</svg>
							{data.product_id}
						</ids>
						<p>{Math.abs(data.amount)}</p>
						<p>
							{#if data.no_discount_flag == true}
								${Math.abs(data.amount * data.price).toFixed(2)}
							{:else}
								<strike>${Math.abs(data.amount * data.price).toFixed(2)}</strike><br />
								${Math.abs(data.amount * data.price * (1 - discount_value / 100)).toFixed(2)}
							{/if}
						</p>
					</product>
				</VirtualScroll>
			</list>
		{/if}
	</lists>
{:else}
	<status>
		<svg width="10" height="10">
			<circle cx="50%" cy="50%" r="5" fill="red" />
		</svg>
		<a href="http://localhost:8123/play" target="_blank">
			Allo... Allo ...hhhr... Сalling for ClickHouse {commas}
		</a>
	</status>
{/if}

<style>
	h1,
	h3,
	button,
	#form,
	status {
		margin: 10px;
		padding: 10px;
		min-width: 150px;
	}
	.headline {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-size: clamp(11px, 1.5vw, 2.7vmin);
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
	.discount_flag {
		border: 5px #ffee00 solid;
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
		display: block;
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
