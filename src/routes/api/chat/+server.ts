import { PUBLIC_DENO_KV_TOKEN, PUBLIC_DENO_KV_URL } from "$env/static/public";
import { openKv } from "@deno/kv";

export async function GET(): Promise<Response> {
    const kv = await openKv(PUBLIC_DENO_KV_URL, {accessToken: PUBLIC_DENO_KV_TOKEN});
    const chats = kv.list<string>({ prefix: ["chat", "message"] });
    
    const result: string[] = [];
    for await(const chat of chats){
        result.push(chat.value);
    }
    
    const stream = kv.watch([['chat', 'last_message_created_at']]);

    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
        }
    });
}