import './style.css'
import { runIncludes } from './includes.js'
import * as nav from './nav.js'
import * as router from './router.js'
import {finishDiscordLogin, startDiscordLogin, logout, getUser} from './auth.js'
import { slugify } from './utils.js'

// Log boot
console.log('[MAIN] Booting up...')

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[MAIN] DOM loaded')

  // Handle Discord OAuth code if present
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (code) {
    console.log('[Auth] OAuth code found, finishing login...')
    try {
      await finishDiscordLogin()
    } catch (err) {
      console.error('[Auth] Failed to finish Discord login:', err)
    }
  }

  // Load nav, includes, and routes
  runIncludes()
  nav.init()
  router.init()

  console.log('[MAIN] Booted up successfully')
})
