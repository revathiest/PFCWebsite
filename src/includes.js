// src/includes.js

const PUBLIC_BASE_PATH = '';

export async function runIncludes() {
  const includeElements = document.querySelectorAll('[data-include]')
  const tasks = Array.from(includeElements).map(async el => {
    const file = el.getAttribute('data-include')
    if (!file) return

    const normalizedPath = file.startsWith('/')
      ? file
      : `${PUBLIC_BASE_PATH}/${file}`.replace(/\/{2,}/g, '/')

    try {
      const res = await fetch(normalizedPath)
      if (!res.ok) throw new Error(`Failed to fetch ${normalizedPath}`)
      const content = await res.text()
      el.innerHTML = content
      if (normalizedPath.includes('nav.html')) {
        document.dispatchEvent(new Event('nav-ready'))
      }
    } catch (err) {
      console.error(`[includes.js] Error loading ${normalizedPath}:`, err)
    }
  })
  return Promise.all(tasks)
}
