# UploadLab — File Upload Strategies, Compared

A demo of four ways to get a file from a browser to storage, so the trade-offs are concrete instead of theoretical. Drop a file in and watch it upload, pause, resume, retry, and (for large files) chunk.

Frontend: Next.js 16 / React 19 / TypeScript. Backend: sibling `file-upload-system--backend` repo (Express 5 + Prisma 7 + Postgres).

## Strategies

|                              | Traditional | Chunked Sequential          | Chunked Worker Pool        | Cloudinary Worker Pool                       |
| ---------------------------- | ----------- | --------------------------- | -------------------------- | -------------------------------------------- |
| **Bytes through our server** | Full file   | Full file (in chunks)       | Full file (in chunks)      | None — chunks go straight to Cloudinary      |
| **Resumable**                | No          | Yes                         | Yes, approximately         | Yes, but limited to our own bookkeeping      |
| **Integrity check**          | None        | Per-chunk + final SHA-256   | Per-chunk + final SHA-256  | Chunk-count/size check only                  |
| **Concurrency**              | 1 request   | 1 chunk at a time           | N chunks at once           | N chunks at once (first/last chunk isolated) |
| **Best fit**                 | Small files | Large files, flaky networks | Large files, fast networks | Large files, managed storage/CDN             |

All strategies dedupe by whole-file SHA-256 hash before transferring any bytes, computed via `crypto.subtle.digest` (`src/lib/upload/hashService.ts`).

The three chunked strategies share one hook, `useFileUploadChunkedBase`, for hashing, init/resume, pause/cancel, and the upload queue — they differ only in how chunks are scheduled. All strategies also share one `UploadQueueContext` so concurrent uploads across the app stay capped.

## Admin/debug views

- `/local-uploads` — debugging page for disk-based uploads (traditional + both chunked strategies). Lists uploads, lets you download merged files, inspect/delete chunks, and delete upload records.
- `/cloudinary` — debugging page for Cloudinary uploads. Lists uploads and their confirmed-chunk bookkeeping.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Set `NEXT_PUBLIC_API_ENDPOINT` in `.env` to point at the backend (see the sibling repo — needs Postgres). No env var is needed for Cloudinary; the backend supplies its config dynamically (and needs its own `CLOUDINARY_*` env vars set).
