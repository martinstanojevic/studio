/**
 * GET /api/resources/:slug/download
 *
 * Streams a zip archive containing every file attached to the given resource.
 *
 * The slug maps to the markdown stem under `content/resources/`. The attached
 * file paths live under /public and are fetched via HTTP so the route works
 * the same in dev, prod, and edge runtimes. The browser caches the resulting
 * zip for an hour — bump `Cache-Control` if file contents start changing more
 * frequently than that.
 */
import JSZip from 'jszip'

interface ResourceFile {
  path: string
  label: string
  role?: string
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const resource = await queryCollection(event, 'teachingResources')
    .path(`/resources/${slug}`)
    .first()

  if (!resource) {
    throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
  }

  const files = (resource.files ?? []) as ResourceFile[]
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Resource has no files' })
  }

  // Build absolute URLs to public assets using the request host. Works in dev
  // (localhost), prod, and behind a reverse proxy without env knobs.
  const proto = (getRequestHeader(event, 'x-forwarded-proto') ?? 'http').split(',')[0]
  const host = getRequestHeader(event, 'host') ?? 'localhost'
  const origin = `${proto}://${host}`

  const zip = new JSZip()

  // Fetch all files in parallel. If any one fails, surface a 502 so the
  // browser doesn't get a half-built zip rendered as a successful download.
  await Promise.all(
    files.map(async (f) => {
      const url = new URL(f.path, origin).toString()
      const res = await fetch(url)
      if (!res.ok) {
        throw createError({
          statusCode: 502,
          statusMessage: `Failed to fetch attached file: ${f.path} (${res.status})`,
        })
      }
      const buf = Buffer.from(await res.arrayBuffer())
      // Preserve original filename for clarity. Decode %20 etc. so the file
      // inside the zip is readable, not URL-encoded gibberish.
      const filename = decodeURIComponent(f.path.split('/').pop() ?? 'file')
      zip.file(filename, buf)
    }),
  )

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', `attachment; filename="${slug}.zip"`)
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return zipBuffer
})
