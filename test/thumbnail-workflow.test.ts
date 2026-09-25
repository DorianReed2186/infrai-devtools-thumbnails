import assert from "node:assert/strict";
import { thumbnailRequest } from "../src/thumbnail_service.js";

const valid = thumbnailRequest.safeParse({ file: "data:image/png;base64,AA", filename: "screen.png", width: 320, height: 180 });
assert.equal(valid.success, true);
const rejected = thumbnailRequest.safeParse({ file: "", filename: "screen.png", width: 0, height: 180 });
assert.equal(rejected.success, false);
console.log("thumbnail request boundary: valid dimensions accepted, empty payload rejected");
