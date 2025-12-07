import qs from "qs";

const rawBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!rawBaseURL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not configured. Set it in .env.local to point at your Laravel backend (e.g. http://127.0.0.1:8000/api)"
  );
}

const baseURL = rawBaseURL.replace(/\/$/, "");

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: BodyInit | Record<string, unknown>;
  query?: Record<string, unknown>;
  authToken?: string | null;
  isForm?: boolean;
};

export async function api(path: string, opts: ApiOptions = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const queryString = opts.query ? `?${qs.stringify(opts.query, { skipNulls: true })}` : "";
  const url = `${baseURL}${normalizedPath}${queryString}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.isForm ? {} : { "Content-Type": "application/json" }),
    ...(opts.headers || {}),
  };

  const token = opts.authToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (token) headers.Authorization = `Bearer ${token}`;

  const requestBody: BodyInit | undefined =
    opts.body == null ? undefined : opts.isForm ? (opts.body as BodyInit) : JSON.stringify(opts.body);

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: requestBody,
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error?.message || err?.message || `Request failed (${res.status})`);
  }
  return safeJson(res);
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text as unknown;
  }
}
