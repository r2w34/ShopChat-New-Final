import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const jsPath = join(process.cwd(), "extensions/chat-widget/assets/chat-widget.js");
    let js = await readFile(jsPath, "utf-8");
    
    // Replace localhost with actual domain
    js = js.replace(/localhost:3000/g, "shopchat-new.indigenservices.com");
    js = js.replace(/http:\/\/twittstock/g, "https://shopchat-new.indigenservices.com");
    js = js.replace(/https:\/\/twittstock\.com/g, "https://shopchat-new.indigenservices.com");
    
    return new Response(js, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("/* JS not found */", {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
