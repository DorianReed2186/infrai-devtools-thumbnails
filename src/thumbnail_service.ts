import { z } from "zod";
import { request } from "./infrai_client.js";

export const thumbnailRequest = z.object({
  file: z.string().min(1), filename: z.string().min(1), width: z.number().int().positive(), height: z.number().int().positive()
});
export type ThumbnailRequest = z.infer<typeof thumbnailRequest>;

export async function generateThumbnail(input: ThumbnailRequest) {
  const parsed = thumbnailRequest.parse(input);
  const uploaded = await request<{ image_id: string }>("/v1/image/upload", { file: parsed.file, filename: parsed.filename });
  const processed = await request<{ url?: string; image?: string }>("/v1/image/process", {
    image: { image_id: uploaded.image_id }, ops: [{ op: "resize", params: { width: parsed.width, height: parsed.height, fit: "cover" } }], format: "webp", store: true
  });
  return { sourceId: uploaded.image_id, thumbnail: processed.url ?? processed.image ?? "" };
}

if (process.argv[1]?.endsWith("thumbnail_service.ts")) {
  const input = { file: process.env.IMAGE_DATA ?? "base64-image", filename: "device-screen.png", width: 320, height: 180 };
  generateThumbnail(input).then((result) => console.log(JSON.stringify({ status: "thumbnail_ready", ...result }))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
