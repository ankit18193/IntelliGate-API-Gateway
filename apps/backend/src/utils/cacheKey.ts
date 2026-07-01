export const generateCacheKey = async (request: Request) => {
  const method = request.method;
  const url = new URL(request.url);

  const pathname = url.pathname;
  const query = url.search;

  let body = "";

  
  if (method !== "GET") {
    try {
      body = await request.text();
    } catch {
      body = "";
    }
  }

  return `${method}:${pathname}${query}:${body}`;
};