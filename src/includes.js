// src/includes.js

export async function runIncludes() {
  const includeElements = document.querySelectorAll('[data-include]')
  const tasks = Array.from(includeElements).map(async el => {
    const file = el.getAttribute('data-include')
    if (!file) return

    try {
      const res = await fetch(file)
      if (!res.ok) throw new Error(`Failed to fetch ${file}`)
      const content = await res.text()
      el.innerHTML = content
      if (file.includes('nav.html')) {
        document.dispatchEvent(new Event('nav-ready'))
      }
    } catch (err) {
      console.error(`[includes.js] Error loading ${file}:`, err)
    }
  })
  return Promise.all(tasks)
}
