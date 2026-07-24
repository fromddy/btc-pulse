function trim(value: string | undefined): string {
  return value?.trim() ?? ''
}

function handleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\/+/, '')
    return path.split('/')[0] ?? ''
  } catch {
    return ''
  }
}

const xUrl = trim(import.meta.env.VITE_X_URL)
const xHandle =
  trim(import.meta.env.VITE_X_HANDLE).replace(/^@/, '') ||
  handleFromUrl(xUrl)
const authorName = trim(import.meta.env.VITE_AUTHOR_NAME)

/** Public runtime config from Vite env. */
export const env = {
  authorName,
  xUrl,
  xHandle,
  hasX: Boolean(xUrl && !xUrl.includes('your_handle')),
  hasAuthor: Boolean(
    authorName && !authorName.toLowerCase().includes('your name'),
  ),
} as const
