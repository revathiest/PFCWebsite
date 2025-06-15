import './style.css'
import { runIncludes } from './includes.js'
import * as nav from './nav.js'
import * as router from './router.js'
import { PFC_CONFIG } from './config.js'
import { finishDiscordLogin } from './auth.js'

const DEBUG = PFC_CONFIG.debug;

// Log boot
if (DEBUG) console.log('[MAIN] Booting up...')

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', async () => {
  if (DEBUG) console.log('[MAIN] DOM loaded')

  // Handle Discord OAuth code if present
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (code) {
    if (DEBUG) console.log('[Auth] OAuth code found, finishing login...')
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

  if (DEBUG) console.log('[MAIN] Booted up successfully')
})
