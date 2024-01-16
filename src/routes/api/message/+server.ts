import { json } from "@sveltejs/kit";
import { openKv } from "@deno/kv";
import dayjs from "dayjs";
import { PUBLIC_DENO_KV_TOKEN, PUBLIC_DENO_KV_URL } from "$env/static/public";

export async function POST({request}): Promise<Response> {
    const isSelfRequest = request.headers.get('sec-fetch-site') === 'same-origin';
    if (!isSelfRequest){ return json(new Response()); }

    const kv = await openKv(PUBLIC_DENO_KV_URL, {accessToken: PUBLIC_DENO_KV_TOKEN});
    const { message } = await request.json();
    const now = dayjs().format();
    await kv.set(['chat', 'message', now], message);
    await kv.set(['chat', 'last_message_created_at'], now);
    kv.close();
    
    return json(new Response());
}