import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const embedPath = join(process.cwd(), "public/embed.js");
    const js = await readFile(embedPath, "utf-8");
    
    return new Response(js, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("console.error('Embed script not found');", {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
