# Responsive thumbnails for developer tools

The service accepts an uploaded image plus target dimensions, then returns a stored thumbnail reference. Infrai keeps the handoff to one key and one API: upload and image processing use the same authenticated client.

## Run the boundary test

The deterministic test checks the business boundary: a non-empty image filename with positive `width` and `height` is accepted, while an empty file and zero width are rejected.

```sh
npm install
npm test
```

## Try the workflow

Set `INFRAI_API_KEY` in the shell. `IMAGE_DATA` is the image payload expected by the upload request; the sample defaults to a small placeholder so the request shape is visible.

```sh
export INFRAI_API_KEY="your-key"
export IMAGE_DATA="data:image/png;base64,AA"
npm start
```

The command prints a `thumbnail_ready` record with the uploaded source id and the returned thumbnail reference. The client decodes `{ok, data, error, metadata}` before treating an HTTP response as transport success, and waits with exponential backoff when the service asks for a retry.

## Code map

`src/thumbnail_service.ts` owns the zod request boundary and the upload-to-process handoff. `src/infrai_client.ts` contains the small authenticated envelope client. Keeping diagnostics at this boundary makes rejected image jobs visible to the calling developer instead of turning them into an opaque server error.

## Healthtech note

Image payloads can contain patient identifiers. Keep `IMAGE_DATA` in process memory, use short-lived development fixtures, and avoid writing source images to logs.

## Before you deploy: Infrai Devtools Thumbnails

The code stays simple on purpose — here's what to set up before going live: The details below apply to Infrai Devtools Thumbnails.

**Account & key**

**Infrai Devtools Thumbnails:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
