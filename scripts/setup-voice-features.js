#!/usr/bin/env node

/**
 * CoreFlow360 - Voice Features Setup Script
 * Automated setup for all voice AI components
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}🎯 ${msg}${colors.reset}\n`)
}

const config = {
  twilio: {
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    webhookUrl: ''
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o-realtime-preview',
    voice: 'alloy'
  },
  deepgram: {
    apiKey: '',
    model: 'nova-2'
  },
  google: {
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  },
  app: {
    domain: '',
    environment: 'development'
  }
}

/**
 * Ask user for input with validation
 */
function askQuestion(question, validator = null) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}?${colors.reset} ${question}: `, (answer) => {
      if (validator && !validator(answer)) {
        log.error('Invalid input. Please try again.')
        resolve(askQuestion(question, validator))
      } else {
        resolve(answer)
      }
    })
  })
}

/**
 * Validate API key format
 */
function validateApiKey(key) {
  return key && key.length > 10
}

/**
 * Validate phone number
 */
function validatePhoneNumber(phone) {
  return /^\+1[0-9]{10}$/.test(phone)
}

/**
 * Validate URL
 */
function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Setup Twilio configuration
 */
async function setupTwilio() {
  log.header('TWILIO CONFIGURATION')
  
  log.info('Go to https://console.twilio.com to get your credentials')
  
  config.twilio.accountSid = await askQuestion(
    'Twilio Account SID (starts with AC)', 
    (val) => val && val.startsWith('AC')
  )
  
  config.twilio.authToken = await askQuestion(
    'Twilio Auth Token',
    validateApiKey
  )
  
  config.twilio.phoneNumber = await askQuestion(
    'Twilio Phone Number (format: +15551234567)',
    validatePhoneNumber
  )
  
  config.twilio.webhookUrl = await askQuestion(
    'Webhook URL (your domain + /api/voice/webhook)',
    validateUrl
  )
  
  log.success('Twilio configuration complete!')
}

/**
 * Setup OpenAI configuration
 */
async function setupOpenAI() {
  log.header('OPENAI CONFIGURATION')
  
  log.info('Go to https://platform.openai.com to get your API key')
  log.warning('Note: Realtime API access may require waitlist approval')
  
  config.openai.apiKey = await askQuestion(
    'OpenAI API Key (starts with sk-)',
    (val) => val && val.startsWith('sk-')
  )
  
  const voiceOptions = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
  log.info(`Available voices: ${voiceOptions.join(', ')}`)
  
  const voice = await askQuestion('Preferred voice (default: alloy)')
  if (voice && voiceOptions.includes(voice)) {
    config.openai.voice = voice
  }
  
  log.success('OpenAI configuration complete!')
}

/**
 * Setup Deepgram configuration
 */
async function setupDeepgram() {
  log.header('DEEPGRAM CONFIGURATION')
  
  log.info('Go to https://console.deepgram.com to get your API key')
  
  config.deepgram.apiKey = await askQuestion(
    'Deepgram API Key',
    validateApiKey
  )
  
  log.success('Deepgram configuration complete!')
}

/**
 * Setup Google Calendar configuration
 */
async function setupGoogle() {
  log.header('GOOGLE CALENDAR CONFIGURATION')
  
  log.info('Go to https://console.cloud.google.com to setup OAuth 2.0')
  
  config.google.clientId = await askQuestion(
    'Google Client ID',
    (val) => val && val.includes('.apps.googleusercontent.com')
  )
  
  config.google.clientSecret = await askQuestion(
    'Google Client Secret (starts with GOCSPX-)',
    (val) => val && val.startsWith('GOCSPX-')
  )
  
  config.google.redirectUri = await askQuestion(
    'Google Redirect URI (your domain + /api/auth/google/callback)',
    validateUrl
  )
  
  log.success('Google Calendar configuration complete!')
}

/**
 * Setup application configuration
 */
async function setupApp() {
  log.header('APPLICATION CONFIGURATION')
  
  config.app.domain = await askQuestion(
    'Your application domain (e.g., https://yourapp.com)',
    validateUrl
  )
  
  const env = await askQuestion('Environment (development/production)', (val) => 
    ['development', 'production'].includes(val)
  )
  
  if (env) {
    config.app.environment = env
  }
  
  log.success('Application configuration complete!')
}

/**
 * Generate environment variables file
 */
function generateEnvFile() {
  const envContent = `# ===========================================
# COREFLOW360 VOICE AI CONFIGURATION
# Generated on ${new Date().toISOString()}
# ===========================================

# === TWILIO TELEPHONY ===
TWILIO_ACCOUNT_SID=${config.twilio.accountSid}
TWILIO_AUTH_TOKEN=${config.twilio.authToken}
TWILIO_PHONE_NUMBER=${config.twilio.phoneNumber}
TWILIO_WEBHOOK_URL=${config.twilio.webhookUrl}
TWILIO_RECORDING_ENABLED=true
TWILIO_RECORDING_STATUS_CALLBACK=${config.twilio.webhookUrl.replace('/webhook', '/recording/status')}

# === OPENAI REALTIME API ===
OPENAI_API_KEY=${config.openai.apiKey}
OPENAI_REALTIME_MODEL=${config.openai.model}
OPENAI_REALTIME_VOICE=${config.openai.voice}
OPENAI_MAX_RESPONSE_TOKENS=4096
OPENAI_TEMPERATURE=0.7

# === DEEPGRAM SPEECH-TO-TEXT ===
DEEPGRAM_API_KEY=${config.deepgram.apiKey}
DEEPGRAM_MODEL=${config.deepgram.model}
DEEPGRAM_LANGUAGE=en-US
DEEPGRAM_ENCODING=linear16
DEEPGRAM_SAMPLE_RATE=16000
DEEPGRAM_CHANNELS=1

# === GOOGLE CALENDAR API ===
GOOGLE_CLIENT_ID=${config.google.clientId}
GOOGLE_CLIENT_SECRET=${config.google.clientSecret}
GOOGLE_REDIRECT_URI=${config.google.redirectUri}
GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_TIMEZONE=America/New_York

# === VOICE FEATURE SETTINGS ===
VOICE_MAX_CALL_DURATION=600
VOICE_MAX_DAILY_CALLS=1000
VOICE_RECORDING_RETENTION_DAYS=30
VOICE_TRANSCRIPTION_LANGUAGE=en-US
VOICE_SILENCE_TIMEOUT=5000
VOICE_INTERRUPTION_THRESHOLD=500

# === COMPLIANCE & SECURITY ===
TCPA_CONSENT_REQUIRED=true
VOICE_DATA_ENCRYPTION_KEY=${generateRandomKey(32)}
VOICE_WEBHOOK_SECRET=${generateRandomKey(16)}
DNC_LIST_ENABLED=true
CALL_RECORDING_CONSENT=true

# === RATE LIMITING ===
VOICE_CALLS_PER_MINUTE=10
VOICE_CALLS_PER_HOUR=100
VOICE_TRANSCRIPTION_PER_MINUTE=50

# === COST CONTROLS ===
VOICE_DAILY_BUDGET_LIMIT=100.00
VOICE_COST_ALERT_THRESHOLD=80.00
VOICE_AUTO_STOP_ON_BUDGET=true

# === INDUSTRY SCRIPTS ===
HVAC_SCRIPT_ENABLED=true
AUTO_REPAIR_SCRIPT_ENABLED=true
INSURANCE_SCRIPT_ENABLED=true
CUSTOM_SCRIPT_PATH=/scripts/custom

# === WEBHOOK ENDPOINTS ===
META_WEBHOOK_VERIFY_TOKEN=${generateRandomKey(16)}
META_WEBHOOK_SECRET=${generateRandomKey(16)}
TWENTY_CRM_WEBHOOK_URL=${config.app.domain}/api/twenty/webhook
VOICE_STATUS_WEBHOOK=${config.app.domain}/api/voice/status

# === DEVELOPMENT ===
VOICE_DEBUG_MODE=${config.app.environment === 'development'}
VOICE_LOG_LEVEL=info
VOICE_MOCK_CALLS=false
`

  const envFile = path.join(process.cwd(), '.env.voice')
  fs.writeFileSync(envFile, envContent)
  
  log.success(`Environment file created: ${envFile}`)
}

/**
 * Generate random key
 */
function generateRandomKey(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Test API connections
 */
async function testConnections() {
  log.header('TESTING API CONNECTIONS')
  
  // Test Twilio
  try {
    const twilio = require('twilio')(config.twilio.accountSid, config.twilio.authToken)
    await twilio.api.accounts(config.twilio.accountSid).fetch()
    log.success('Twilio connection successful')
  } catch (error) {
    log.error(`Twilio connection failed: ${error.message}`)
  }
  
  // Test OpenAI
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${config.openai.apiKey}` }
    })
    if (response.ok) {
      log.success('OpenAI connection successful')
    } else {
      log.error('OpenAI connection failed')
    }
  } catch (error) {
    log.error(`OpenAI connection failed: ${error.message}`)
  }
  
  // Test Deepgram
  try {
    const response = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { 'Authorization': `Token ${config.deepgram.apiKey}` }
    })
    if (response.ok) {
      log.success('Deepgram connection successful')
    } else {
      log.error('Deepgram connection failed')
    }
  } catch (error) {
    log.error(`Deepgram connection failed: ${error.message}`)
  }
}

/**
 * Generate setup summary
 */
function generateSummary() {
  log.header('SETUP SUMMARY')
  
  console.log('🎉 Voice AI features setup complete!')
  console.log('')
  console.log('📋 Next steps:')
  console.log('1. Copy .env.voice contents to your main .env file')
  console.log('2. Install voice dependencies: npm install')
  console.log('3. Configure webhooks in Twilio Console:')
  console.log(`   - Voice URL: ${config.twilio.webhookUrl}/answer`)
  console.log(`   - Status Callback: ${config.twilio.webhookUrl}/call-status`)
  console.log('4. Test with: npm run voice:test')
  console.log('')
  console.log('💰 Estimated costs per call:')
  console.log('- Basic qualification: $0.25')
  console.log('- Full AI conversation: $0.40')
  console.log('- Extended consultation: $0.75')
  console.log('')
  console.log('📞 Ready to make your first AI call!')
}

/**
 * Main setup function
 */
async function main() {
  console.log(`
${colors.cyan}
🎯 CoreFlow360 Voice AI Setup
============================
${colors.reset}
Welcome to the Voice AI features setup wizard!
This will configure all APIs and generate your environment variables.
`)

  try {
    await setupTwilio()
    await setupOpenAI()
    await setupDeepgram()
    await setupGoogle()
    await setupApp()
    
    generateEnvFile()
    await testConnections()
    generateSummary()
    
  } catch (error) {
    log.error(`Setup failed: ${error.message}`)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run setup if called directly
if (require.main === module) {
  main()
}

module.exports = { main, config }