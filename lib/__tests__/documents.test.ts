import { loadDocument, loadDocuments } from '../documents'

describe('loadDocument', () => {
  it('loads aria-identity.md and returns a non-empty string', async () => {
    const content = await loadDocument('aria-identity')
    expect(typeof content).toBe('string')
    expect(content.length).toBeGreaterThan(0)
    expect(content).toContain('ARIA')
  })

  it('loads behavioral-rules.md', async () => {
    const content = await loadDocument('behavioral-rules')
    expect(content).toContain('NEVER break character')
  })

  it('throws for unknown document', async () => {
    await expect(loadDocument('nonexistent' as any)).rejects.toThrow()
  })
})

describe('loadDocuments', () => {
  it('loads multiple documents and concatenates them', async () => {
    const content = await loadDocuments(['aria-identity', 'behavioral-rules'])
    expect(content).toContain('ARIA')
    expect(content).toContain('NEVER break character')
  })
})
