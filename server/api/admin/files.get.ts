/**
 * GET /api/admin/files
 *
 * Lists every file under public/resources for the admin files panel (the
 * floating button shown inside Studio's preview), so admins can copy
 * paste-ready paths into a resource's Files → Src field. The list is a
 * build-time snapshot (see scanResourceFiles in nuxt.config.ts) — files
 * uploaded through Studio appear here after the publish triggers a redeploy.
 */
import type { ResourceFileEntry } from '#shared/types/admin-files'

export default defineEventHandler((event): ResourceFileEntry[] => {
  return useRuntimeConfig(event).resourceFilesManifest as ResourceFileEntry[]
})
