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
	async function apiGet(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			let body = await response.json();
			return body.message;
		} catch (error) {
			console.log(error);
			return 'Sorry. Some error. Try again later';
		}
	}

	async function createClickhouseDB(): Promise<void> {
		status_create_database = await apiGet('/api/create_db');
	}

	async function createClickhouseTable(): Promise<void> {
		status_create_tables = await apiGet('/api/create_table');
	}

	async function populateClickhouseTable(): Promise<void> {
		status_populate = await apiGet('/api/populate');
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
