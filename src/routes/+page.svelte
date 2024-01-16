<script lang="ts">
	import { Input, ButtonGroup } from 'flowbite-svelte';
    import { onMount } from 'svelte';
	import axios from 'redaxios';
	import dayjs from 'dayjs';

	let messages: { key: string[], value: string }[] = [];
	const getChatStream = async () => {
		const stream = await axios.get('/api/chat/stream', { responseType: 'stream' });
		const reader = stream.body?.pipeThrough(new TextDecoderStream()).getReader();
		while (true) {
			const { value, done } = await reader?.read();
			if (done) { break; }
			messages = JSON.parse(value);
		}
	};

	let message = '';
	const sendMessage = async (event: KeyboardEvent) => {
		const isSubmit = event.key === 'Enter';
		if (!isSubmit) {
			return;
		}

		const res = await axios.post('/api/message', { message: message });
	};

	onMount(() => {
        getChatStream();
    })
</script>

<div>
	<form>
		<ButtonGroup class="m-5 w-1/2" size="md">
			<Input
				type="text"
				id="message"
				placeholder="message"
				bind:value={message}
				on:keypress={sendMessage}
			/>
		</ButtonGroup>
	</form>

	<div class="messages m-5 w-1/2">
		{#each messages.slice(-5) as message}
		<div class="text-ellipsis break-all rounded-lg border-2 border-solid border-red-100 bg-red-50 p-2 m-2">
			<div>
				{message.value}
			</div>
			<div class="text-right">
				{dayjs(message.key[2]).format('HH:mm:ss')}
			</div>
		</div>
		{/each}
		
	</div>
</div>
