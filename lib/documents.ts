import fs from 'fs/promises'
import path from 'path'

export type DocumentName =
  | 'aria-identity'
  | 'behavioral-rules'
  | 'director-notes'
  | 'story-script'
  | 'puzzle-hints'

export async function loadDocument(name: DocumentName): Promise<string> {
  const filePath = path.join(process.cwd(), 'content', `${name}.md`)
  return fs.readFile(filePath, 'utf-8')
}

export async function loadDocuments(names: DocumentName[]): Promise<string> {
  const contents = await Promise.all(names.map(loadDocument))
  return contents.join('\n\n---\n\n')
}
