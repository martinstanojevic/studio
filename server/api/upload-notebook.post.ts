import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildFrontmatter(fields: Record<string, unknown>, notebookDownload: string): string {
  const lines: string[] = ['---']

  const scalar = (key: string, val: unknown) => {
    if (typeof val === 'number') lines.push(`${key}: ${val}`)
    else lines.push(`${key}: ${String(val)}`)
  }

  const array = (key: string, val: unknown) => {
    const arr = Array.isArray(val) ? val : String(val).split(',').map(s => s.trim()).filter(Boolean)
    if (!arr.length) return
    lines.push(`${key}:`)
    for (const item of arr) lines.push(`  - ${item}`)
  }

  scalar('title', fields.title)
  scalar('description', fields.description)
  scalar('type', fields.type)
  scalar('function', fields.function)
  scalar('modality', fields.modality)
  scalar('coverage', fields.coverage)
  array('textbookVersions', fields.textbookVersions)
  array('topicTags', fields.topicTags)
  array('learningGoals', fields.learningGoals)
  scalar('lengthMinutes', Number(fields.lengthMinutes) || 0)
  scalar('notebookDownload', notebookDownload)

  if (fields.extraMaterials) {
    array('extraMaterials', fields.extraMaterials)
  }

  lines.push('---')
  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'Multipart form data required' })
  }

  // Collect fields
  const fields: Record<string, string> = {}
  let fileBuffer: Buffer | null = null
  let originalName = ''

  for (const part of form) {
    if (part.name === 'file') {
      fileBuffer = part.data
      originalName = part.filename || 'notebook.ipynb'
    } else if (part.name) {
      fields[part.name] = part.data.toString('utf-8')
    }
  }

  if (!fileBuffer) {
    throw createError({ statusCode: 400, statusMessage: 'No .ipynb file provided' })
  }

  if (!originalName.endsWith('.ipynb')) {
    throw createError({ statusCode: 400, statusMessage: 'File must be a .ipynb notebook' })
  }

  // Required frontmatter fields
  const required = ['title', 'description', 'type', 'function', 'modality', 'coverage']
  for (const key of required) {
    if (!fields[key]) {
      throw createError({ statusCode: 400, statusMessage: `Missing required field: ${key}` })
    }
  }

  // Validate it's valid notebook JSON
  try {
    const parsed = JSON.parse(fileBuffer.toString('utf-8'))
    if (!Array.isArray(parsed.cells)) {
      throw new Error('no cells')
    }
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid notebook JSON' })
  }

  const slug = slugify(fields.title!)
  const subfolder = fields.subfolder || ''

  // 1. Save the raw .ipynb to public/notebooks/
  const notebooksDir = join(process.cwd(), 'public', 'notebooks')
  await mkdir(notebooksDir, { recursive: true })
  const ipynbFilename = `${slug}.ipynb`
  await writeFile(join(notebooksDir, ipynbFilename), fileBuffer)

  // 2. Create a thin .md stub in content/resources/ for catalog visibility
  const notebookDownload = `/notebooks/${ipynbFilename}`
  const frontmatter = buildFrontmatter(fields, notebookDownload)
  const body = [
    `This resource is a Jupyter notebook.`,
    ``,
    `[Download the notebook](${notebookDownload}){download="${ipynbFilename}"}`,
  ].join('\n')
  const markdown = `${frontmatter}\n\n${body}\n`

  const contentDir = subfolder
    ? join(process.cwd(), 'content', 'resources', subfolder)
    : join(process.cwd(), 'content', 'resources')
  await mkdir(contentDir, { recursive: true })
  await writeFile(join(contentDir, `${slug}.md`), markdown, 'utf-8')

  return {
    success: true,
    path: `/resources/${subfolder ? subfolder + '/' : ''}${slug}`,
    filename: `${slug}.md`,
    notebookDownload,
  }
})
