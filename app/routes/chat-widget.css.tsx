import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cssPath = join(process.cwd(), "extensions/chat-widget/assets/chat-widget.css");
    const css = await readFile(cssPath, "utf-8");
    
    return new Response(css, {
      headers: {
        "Content-Type": "text/css",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("/* CSS not found */", {
      status: 404,
      headers: { "Content-Type": "text/css" },
    });
  }
}
