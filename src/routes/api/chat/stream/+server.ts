import { PUBLIC_DENO_KV_TOKEN, PUBLIC_DENO_KV_URL } from "$env/static/public";
import { openKv } from "@deno/kv";

export async function GET(): Promise<Response> {
    const kv = await openKv(PUBLIC_DENO_KV_URL, { accessToken: PUBLIC_DENO_KV_TOKEN });

    const stream = kv.watch([['chat', 'last_message_created_at']]).getReader();
    const body = new ReadableStream({
        async start(controller) {
            while (true) {
                if (((await stream.read()).done)) { return; }

                const data = kv.list<string>({prefix: ['chat', 'message']});
                const messages: any[] = [];
                for await ( const message of data ){ messages.push(message); }
                controller.enqueue(
                    new TextEncoder().encode(JSON.stringify(messages)),
                );
            }
        },
        cancel() {
            stream.cancel();
        }
    });

    return new Response(body, {
        headers: {
            "Content-Type": "text/event-stream",
        },
    })
}