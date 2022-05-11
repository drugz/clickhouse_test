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
	export let ping: string;
	let status_create_database = '';
	async function createClickhouseDB(): Promise<void> {
		const response = await fetch('/api/create_db');
		let body = await response.json();
		status_create_database = body.message || 'Sorry. Some error';
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
{:else}
	<status transition:fade>No connection to ClickHouse</status>
{/if}

