import './style.css'
import './includes.js'
import * as nav from './nav.js'
import * as router from './router.js'
import * as PFCDiscord from './auth.js' // or wherever it's defined

nav.init()

const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')

if (code) {
  console.log('[SPA] Found OAuth code, finishing login...')
  await PFCDiscord.finishDiscordLogin()
}

router.init()
