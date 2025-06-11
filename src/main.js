// src/main.js

// Global styles
import './style.css'

// App logic modules
import { runIncludes } from './includes.js'
import * as nav from './nav.js'
import * as router from './router.js'
import * as PFCDiscord from './auth.js'
// utils are now modular; import as needed
import { slugify } from './utils.js'

// Run includes (e.g. nav, footer injection)
runIncludes()

// Init navigation and routing
nav.init()
router.init()

console.log('[MAIN] Booted up successfully')
