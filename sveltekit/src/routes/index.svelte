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
	let products = [];
	let coupons = [];
	let cart_products = [];
	let total_cart_price = 0;

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
			console.log(body);
			return body.data;
		} catch (error) {
			console.log(error);
			return ['Sorry. Some error. Try again later'];
		}
	}

	async function createClickhouseDB(): Promise<void> {
		status_create_database = await getStatus('/api/create_db');
	}

	async function createClickhouseTable(): Promise<void> {
		status_create_tables = await getStatus('/api/create_table');
	}

	async function populateClickhouseTable(): Promise<void> {
		status_populate = await getStatus('/api/populate');
		products = await getData('products', 100);
		coupons = await getData('coupons');
		cart_products = await getData('cart_products');
		total_cart_price = await getData('total_cart_price');
	}
</script>

<h1>Demo app</h1>
<h2>SvelteKit & ClickHouse DB</h2>
<hr />
{#if ping}
	<status transition:fade>
		{ping}
	</status>

	<br />
	<button on:click={createClickhouseDB}>Create database</button>
	{#if status_create_database}
		<status transition:fade>
			{status_create_database}
		</status>
	{/if}
	<br />
	<button on:click={createClickhouseTable}>Create tables</button>
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
	<br />
{:else}
	<status transition:fade>No connection to ClickHouse</status>
{/if}

<style>
	h1,
	h2,
	button,
	status {
		margin: 10px;
		padding: 10px;
		min-width: 150px;
	}
</style>
