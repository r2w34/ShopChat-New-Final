import type { TypedResponse } from "@remix-run/node";

export function cors<T>(
  request: Request,
  response: TypedResponse<T>
): TypedResponse<T> {
  const headers = new Headers(response.headers);
  
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  }) as TypedResponse<T>;
}
