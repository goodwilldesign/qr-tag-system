// scripts/generate-print-templates.mjs
import fs from 'node:fs'
import path from 'node:path'

// Helper to load .env if present
function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = val
          }
        }
      }
    } catch (e) {
      console.warn('Note: Could not parse local .env file:', e.message)
    }
  }
}

loadLocalEnv()

const templatesDir = path.resolve(process.cwd(), 'public', 'templates')
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true })
}

// ── 1. Pet Collar & Lost Card (800 x 1200) ─────────────────────────
const petTagSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
  <defs>
    <linearGradient id="petBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="100%" stop-color="#fef3c7" />
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#78350f" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Outer Card Background -->
  <rect x="24" y="24" width="752" height="1152" rx="40" fill="url(#petBg)" stroke="#fde68a" stroke-width="4" />

  <!-- Header Banner -->
  <rect x="56" y="56" width="688" height="180" rx="28" fill="url(#amberGrad)" filter="url(#shadow)" />
  <circle cx="120" cy="146" r="44" fill="#ffffff" fill-opacity="0.2" />
  <text x="120" y="162" font-family="system-ui, sans-serif" font-size="48" font-weight="900" fill="#ffffff" text-anchor="middle">🐶</text>
  <text x="190" y="126" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="1">IF I AM LOST</text>
  <text x="190" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#fef3c7">PLEASE SCAN MY TAG</text>

  <!-- Subheading Info -->
  <text x="400" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="#78350f" text-anchor="middle">
    Scan with your phone camera to reach my owner directly
  </text>
  <text x="400" y="324" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#b45309" text-anchor="middle">
    Instant WhatsApp &amp; Emergency Dial &bull; No App Needed
  </text>

  <!-- QR Target Zone Box (Center: x=400, y=624, size=368) -->
  <rect x="180" y="404" width="440" height="440" rx="36" fill="#ffffff" stroke="#fcd34d" stroke-width="4" filter="url(#shadow)" />
  <rect x="196" y="420" width="408" height="408" rx="28" fill="#fafaf9" stroke="#fef3c7" stroke-width="2" />

  <!-- Corner Guide Reticles for QR Placement -->
  <path d="M 220 470 L 220 444 A 4 4 0 0 1 224 440 L 250 440" stroke="#d97706" stroke-width="6" fill="none" stroke-linecap="round" />
  <path d="M 580 470 L 580 444 A 4 4 0 0 0 576 440 L 550 440" stroke="#d97706" stroke-width="6" fill="none" stroke-linecap="round" />
  <path d="M 220 778 L 220 804 A 4 4 0 0 0 224 808 L 250 808" stroke="#d97706" stroke-width="6" fill="none" stroke-linecap="round" />
  <path d="M 580 778 L 580 804 A 4 4 0 0 1 576 808 L 550 808" stroke="#d97706" stroke-width="6" fill="none" stroke-linecap="round" />

  <!-- Reward Badge -->
  <rect x="230" y="880" width="340" height="64" rx="32" fill="#d97706" fill-opacity="0.12" stroke="#d97706" stroke-width="2" />
  <text x="400" y="921" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#92400e" text-anchor="middle">
    ✨ REWARD FOR SAFE RETURN ✨
  </text>

  <!-- Medical & Vet Notice -->
  <text x="400" y="990" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#78350f" text-anchor="middle">
    Dietary, allergy, and vet clinic details on profile
  </text>

  <!-- Footer Branding -->
  <line x1="100" y1="1040" x2="700" y2="1040" stroke="#fde68a" stroke-width="2" stroke-dasharray="8 8" />
  <text x="400" y="1086" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#1c1917" text-anchor="middle">
    GetURQR.com
  </text>
  <text x="400" y="1116" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="500" fill="#a8a29e" text-anchor="middle">
    Smart Life &amp; Pet Safety Tags &bull; Always Dynamic
  </text>
</svg>`

// ── 2. Vehicle Parking Windshield Sticker (1000 x 600) ───────────────
const parkingStickerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600">
  <defs>
    <linearGradient id="parkingBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <filter id="pShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Windshield Decal Base -->
  <rect x="20" y="20" width="960" height="560" rx="36" fill="url(#parkingBg)" stroke="#334155" stroke-width="4" />
  <rect x="28" y="28" width="944" height="544" rx="28" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- Left Content Column -->
  <g transform="translate(60, 60)">
    <!-- Badge -->
    <rect x="0" y="0" width="180" height="44" rx="22" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1.5" />
    <text x="90" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#38bdf8" text-anchor="middle" letter-spacing="1">PARKED VEHICLE</text>

    <!-- Main Title -->
    <text x="0" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Need Me to Move?</text>
    <text x="0" y="142" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#94a3b8">Scan to notify owner</text>

    <!-- Bullets -->
    <g transform="translate(0, 190)">
      <circle cx="12" cy="12" r="6" fill="#38bdf8" />
      <text x="32" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#e2e8f0">Instant WhatsApp &amp; SMS Alert</text>

      <circle cx="12" cy="52" r="6" fill="#38bdf8" />
      <text x="32" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#e2e8f0">100% Phone Number Privacy</text>

      <circle cx="12" cy="92" r="6" fill="#38bdf8" />
      <text x="32" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#e2e8f0">Quick presets: Blocked, Lights On, Alarm</text>
    </g>

    <!-- Footer Security Note -->
    <text x="0" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#64748b">
      POWERED BY GETURQR.COM &bull; SMART PARKING TAG
    </text>
  </g>

  <!-- Right Column: QR Container (Center: x=750, y=300, size=240) -->
  <rect x="630" y="180" width="240" height="240" rx="28" fill="#ffffff" filter="url(#pShadow)" />
  <rect x="642" y="192" width="216" height="216" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- QR Label Tag -->
  <rect x="670" y="126" width="160" height="36" rx="18" fill="#2563eb" />
  <text x="750" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">SCAN CAMERA</text>

  <!-- Bottom Scan Tip -->
  <text x="750" y="456" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">
    No App Required &bull; Fast &amp; Free
  </text>
</svg>`

// ── 3. Smart Luggage & Bag Loop Tag (600 x 1000) ────────────────────
const luggageTagSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1000" width="600" height="1000">
  <defs>
    <linearGradient id="luggageBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <filter id="lShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Luggage Tag Outer -->
  <rect x="20" y="20" width="560" height="960" rx="36" fill="url(#luggageBg)" stroke="#059669" stroke-width="3" />

  <!-- Strap Hole Reinforcement -->
  <circle cx="300" cy="70" r="24" fill="#022c22" stroke="#34d399" stroke-width="4" />

  <!-- Airplane Banner -->
  <g transform="translate(300, 160)">
    <circle cx="0" cy="0" r="38" fill="#10b981" fill-opacity="0.2" />
    <text x="0" y="14" font-family="system-ui, sans-serif" font-size="40" text-anchor="middle">✈️</text>
    <text x="0" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">SMART LUGGAGE TAG</text>
    <text x="0" y="102" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#6ee7b7" text-anchor="middle">IF FOUND, SCAN TO CONTACT TRAVELER</text>
  </g>

  <!-- QR Target Zone (Center: x=300, y=520, size=288) -->
  <rect x="156" y="376" width="288" height="288" rx="28" fill="#ffffff" filter="url(#lShadow)" />
  <rect x="168" y="388" width="264" height="264" rx="20" fill="#f0fdf4" stroke="#dcfce7" stroke-width="2" />

  <!-- Corner Decors -->
  <path d="M 188 430 L 188 408 A 4 4 0 0 1 192 404 L 214 404" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M 412 430 L 412 408 A 4 4 0 0 0 408 404 L 386 404" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M 188 610 L 188 632 A 4 4 0 0 0 192 636 L 214 636" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M 412 610 L 412 632 A 4 4 0 0 1 408 636 L 386 636" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round" />

  <!-- Info Box -->
  <rect x="80" y="700" width="440" height="120" rx="20" fill="#065f46" fill-opacity="0.5" stroke="#059669" stroke-width="1.5" />
  <text x="300" y="736" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#a7f3d0" text-anchor="middle">
    Protected by Global Privacy Routing
  </text>
  <text x="300" y="768" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#ffffff" text-anchor="middle">
    Owner details update in real-time worldwide
  </text>
  <text x="300" y="796" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#34d399" text-anchor="middle">
    Flight number, destination &amp; emergency phone
  </text>

  <!-- Footer -->
  <text x="300" y="900" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">
    GetURQR.com &bull; Travel Safe
  </text>
</svg>`

// ── 4. Smart Doorbell & Delivery Plaque (800 x 1200) ────────────────
const doorbellSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
  <defs>
    <linearGradient id="doorbellBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#27272a" />
    </linearGradient>
    <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <filter id="dShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <rect x="24" y="24" width="752" height="1152" rx="40" fill="url(#doorbellBg)" stroke="#3f3f46" stroke-width="4" />

  <!-- Top Accent Bar -->
  <rect x="60" y="60" width="680" height="16" rx="8" fill="url(#violetGrad)" />

  <!-- Header -->
  <text x="400" y="150" font-family="system-ui, sans-serif" font-size="56" text-anchor="middle">🔔</text>
  <text x="400" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">SMART DOORBELL</text>
  <text x="400" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#a1a1aa" text-anchor="middle">
    Scan with your phone to notify the resident
  </text>

  <!-- QR Target Zone (Center: x=400, y=624, size=368) -->
  <rect x="180" y="404" width="440" height="440" rx="36" fill="#ffffff" filter="url(#dShadow)" />
  <rect x="196" y="420" width="408" height="408" rx="28" fill="#fafafa" stroke="#e4e4e7" stroke-width="2" />

  <!-- Delivery Instructions Box -->
  <rect x="100" y="880" width="600" height="140" rx="24" fill="#27272a" stroke="#52525b" stroke-width="2" />
  <text x="400" y="930" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#a855f7" text-anchor="middle">
    📦 COURIER &amp; DELIVERY NOTICE
  </text>
  <text x="400" y="966" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#e4e4e7" text-anchor="middle">
    Please leave packages at the doorstep if resident is unavailable
  </text>
  <text x="400" y="996" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#71717a" text-anchor="middle">
    Instant WhatsApp notification sent upon scanning
  </text>

  <!-- Footer -->
  <text x="400" y="1100" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#71717a" text-anchor="middle">
    GetURQR.com &bull; Digital Visitor System
  </text>
</svg>`

// ── 5. Child Emergency Safety ID Card (1050 x 600) ──────────────────
const childSafetySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 600" width="1050" height="600">
  <defs>
    <linearGradient id="childBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <filter id="cShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#9f1239" flood-opacity="0.15" />
    </filter>
  </defs>

  <rect x="20" y="20" width="1010" height="560" rx="36" fill="url(#childBg)" stroke="#fecdd3" stroke-width="4" />

  <!-- Left Column -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="220" height="44" rx="22" fill="#e11d48" />
    <text x="110" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">CHILD SAFETY ID</text>

    <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="900" fill="#881337">Emergency Contact</text>
    <text x="0" y="146" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#be123c">Scan to call parents immediately</text>

    <g transform="translate(0, 190)">
      <circle cx="12" cy="12" r="6" fill="#e11d48" />
      <text x="32" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#4c0519">Parent &amp; Guardian WhatsApp Direct Connect</text>

      <circle cx="12" cy="52" r="6" fill="#e11d48" />
      <text x="32" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#4c0519">Blood Group, Allergies &amp; Medical Notes</text>

      <circle cx="12" cy="92" r="6" fill="#e11d48" />
      <text x="32" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#4c0519">School details &amp; Secondary emergency contacts</text>
    </g>

    <text x="0" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#9f1239">
      KEEP WITH CHILD IN BACKPACK, POCKET OR WRISTBAND
    </text>
  </g>

  <!-- Right Column QR Zone (Center: x=798, y=300, size=240) -->
  <rect x="678" y="180" width="240" height="240" rx="28" fill="#ffffff" filter="url(#cShadow)" />
  <rect x="690" y="192" width="216" height="216" rx="20" fill="#fff1f2" stroke="#fecdd3" stroke-width="2" />
  
  <rect x="718" y="126" width="160" height="36" rx="18" fill="#e11d48" />
  <text x="798" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">SCAN ME</text>
</svg>`

// ── 6. Universal Minimalist Badge (800 x 1000) ──────────────────────
const universalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="uniBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <filter id="uShadow">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Modern White Card with Clean Border -->
  <rect x="24" y="24" width="752" height="952" rx="36" fill="url(#uniBg)" stroke="#e2e8f0" stroke-width="4" />

  <!-- Top Logo & Tagline -->
  <text x="400" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2">
    GETURQR
  </text>
  <text x="400" y="170" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#64748b" text-anchor="middle">
    Scan with your smartphone camera
  </text>

  <!-- QR Target Zone (Center: x=400, y=500, size=416) -->
  <rect x="192" y="292" width="416" height="416" rx="36" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#uShadow)" />
  <rect x="208" y="308" width="384" height="384" rx="28" fill="#f8fafc" stroke="#f1f5f9" stroke-width="2" />

  <!-- Sleek Corner Reticles -->
  <path d="M 230 350 L 230 334 A 4 4 0 0 1 234 330 L 250 330" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M 570 350 L 570 334 A 4 4 0 0 0 566 330 L 550 330" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M 230 650 L 230 666 A 4 4 0 0 0 234 670 L 250 670" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round" />
  <path d="M 570 650 L 570 666 A 4 4 0 0 1 566 670 L 550 670" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round" />

  <!-- Bottom Message -->
  <text x="400" y="780" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#0f172a" text-anchor="middle">
    Connect &bull; Return &bull; Inquire
  </text>
  <text x="400" y="816" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#64748b" text-anchor="middle">
    Dynamic Smart Tag Powered by GetURQR.com
  </text>
</svg>`

// Write files to public/templates
const TEMPLATES_LIST = [
  {
    name: 'Pet Collar & Emergency Card',
    type: 'dog',
    filename: 'pet-tag-template.svg',
    content: petTagSvg,
    qr_x: 50,
    qr_y: 52,
    qr_size: 46
  },
  {
    name: 'Vehicle Windshield Sticker',
    type: 'parking',
    filename: 'parking-sticker-template.svg',
    content: parkingStickerSvg,
    qr_x: 75,
    qr_y: 50,
    qr_size: 40
  },
  {
    name: 'Smart Luggage Tag',
    type: 'all',
    filename: 'luggage-tag-template.svg',
    content: luggageTagSvg,
    qr_x: 50,
    qr_y: 52,
    qr_size: 48
  },
  {
    name: 'Smart Doorbell Plaque',
    type: 'doorbell',
    filename: 'doorbell-template.svg',
    content: doorbellSvg,
    qr_x: 50,
    qr_y: 52,
    qr_size: 46
  },
  {
    name: 'Child Safety Emergency Card',
    type: 'kids',
    filename: 'child-safety-template.svg',
    content: childSafetySvg,
    qr_x: 76,
    qr_y: 50,
    qr_size: 38
  },
  {
    name: 'Universal Minimalist Badge',
    type: 'all',
    filename: 'universal-minimal-template.svg',
    content: universalSvg,
    qr_x: 50,
    qr_y: 50,
    qr_size: 52
  }
]

console.log('🎨 Writing template SVG files to public/templates/ ...')
for (const t of TEMPLATES_LIST) {
  const filePath = path.join(templatesDir, t.filename)
  fs.writeFileSync(filePath, t.content.trim(), 'utf8')
  console.log(`  ✓ Saved: public/templates/${t.filename}`)
}

console.log('✅ All 6 template SVG files generated successfully!')
