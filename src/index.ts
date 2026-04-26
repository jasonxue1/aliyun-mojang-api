type Route = {
  prefix: string;
  upstream: string;
};

const ROUTES: Route[] = [
  { prefix: "/auth", upstream: "https://authserver.mojang.com" },
  { prefix: "/account", upstream: "https://api.mojang.com" },
  { prefix: "/session", upstream: "https://sessionserver.mojang.com" },
  { prefix: "/services", upstream: "https://api.minecraftservices.com" },
  { prefix: "/profiles", upstream: "https://api.mojang.com" },
];

function resolveRoute(pathname: string): Route | null {
  for (const route of ROUTES) {
    if (pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) {
      return route;
    }
  }
  return null;
}

function toUpstreamUrl(url: URL, route: Route): string {
  const strippedPath = url.pathname.slice(route.prefix.length) || "/";
  const target = new URL(route.upstream);
  target.pathname = strippedPath;
  target.search = url.search;
  return target.toString();
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const route = resolveRoute(url.pathname);

    if (!route) {
      return new Response(
        "Unknown route. Use /auth, /account, /session, /services or /profiles.",
        {
          status: 404,
          headers: { "content-type": "text/plain; charset=utf-8" },
        },
      );
    }

    const upstreamUrl = toUpstreamUrl(url, route);
    const upstreamRequest = new Request(upstreamUrl, request);
    return fetch(upstreamRequest);
  },
};
