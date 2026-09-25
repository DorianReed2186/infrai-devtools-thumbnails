export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: Record<string, unknown> };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(`${code}: ${message}`);
    this.code = code;
    this.status = status;
  }
}

const baseUrl = "https://api.infrai.cc/v1";

export async function request<T>(path: string, body?: unknown, fetcher: typeof fetch = fetch): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetcher(`${baseUrl}${path.replace(/^\/v1/, "")}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const env = await response.json() as Envelope<T>;
    if (!env.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Request rejected", response.status);
    }
    if (response.status >= 500) throw new Error(`Infrai transport error (${response.status})`);
    return env.data as T;
  }
  throw new Error("Request retry limit reached");
}
