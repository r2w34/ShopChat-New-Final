import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const loaderPath = join(process.cwd(), "public/widget-loader.js");
    const js = await readFile(loaderPath, "utf-8");
    
    return new Response(js, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return new Response("console.error('Widget loader not found');", {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
