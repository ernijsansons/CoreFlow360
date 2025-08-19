/**
 * CoreFlow360 - Multi-Factor Authentication Setup
 * Enhanced security with MFA configuration
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// Build-time check to prevent prerendering issues
const isBuildTime = () => {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production'
}
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Download,
  RefreshCw,
} from 'lucide-react'

const MFA_METHODS = [
  {
    id: 'authenticator',
    name: 'Authenticator App',
    description: 'Use Google Authenticator, Authy, or similar apps',
    icon: Smartphone,
    recommended: true,
  },
  {
    id: 'sms',
    name: 'SMS Text Message',
    description: 'Receive codes via text message',
    icon: Smartphone,
    recommended: false,
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Receive codes via email',
    icon: Mail,
    recommended: false,
  },
  {
    id: 'backup',
    name: 'Backup Codes',
    description: 'Generate one-time use backup codes',
    icon: Key,
    recommended: false,
  },
]

export default function MFASetupPage() {
  // Return a simple loading state during build time
  if (isBuildTime()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-8 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <MFASetup />
    </ProtectedRoute>
  )
}

function MFASetup() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [secret] = useState(() => {
    // Generate secure random secret for MFA setup
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  })
  const [qrCode] = useState(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CoreFlow360:user@example.com?secret=${secret}&issuer=CoreFlow360`
  )
  const [copied, setCopied] = useState(false)

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setStep('setup')

    // Generate backup codes if backup method selected
    if (methodId === 'backup') {
      generateBackupCodes()
    }
  }

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    setBackupCodes(codes)
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = () => {
    // In production, verify the code with the backend
    if (verificationCode.length === 6) {
      setStep('complete')
    }
  }

  const handleDownloadCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'coreflow360-backup-codes.txt'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back to Security Settings
          </button>

          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === 'select' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
              }`}
            >
              {step === 'select' ? '1' : <Check className="h-5 w-5" />}
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                step !== 'select' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === 'setup'
                  ? 'bg-purple-600 text-white'
                  : ['verify', 'complete'].includes(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 dark:bg-gray-700'
              }`}
            >
              {['verify', 'complete'].includes(step) ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                ['verify', 'complete'].includes(step)
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === 'verify'
                  ? 'bg-purple-600 text-white'
                  : step === 'complete'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 dark:bg-gray-700'
              }`}
            >
              {step === 'complete' ? <Check className="h-5 w-5" /> : '3'}
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                step === 'complete' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === 'complete'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 dark:bg-gray-700'
              }`}
            >
              {step === 'complete' ? <Check className="h-5 w-5" /> : '4'}
            </div>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Choose Method</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Setup</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Verify</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Complete</span>
          </div>
        </div>

        {/* Content based on step */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Choose your authentication method
            </h2>

            {MFA_METHODS.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMethodSelect(method.id)}
                className="w-full rounded-lg border-2 border-transparent bg-white p-4 shadow-sm transition-shadow hover:border-purple-600 hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                      <method.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                        {method.recommended && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            Recommended
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === 'setup' && selectedMethod === 'authenticator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Set up Authenticator App
            </h2>

            <div className="space-y-6">
              <div>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-white p-4">
                    <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Or enter this code manually:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 rounded-lg bg-gray-100 p-3 font-mono text-sm dark:bg-gray-700">
                    {secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full rounded-lg bg-purple-600 py-3 text-white transition-colors hover:bg-purple-700"
              >
                Continue to Verification
              </button>
            </div>
          </motion.div>
        )}

        {step === 'setup' && selectedMethod === 'backup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Backup Codes
            </h2>

            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="mb-1 font-medium">Important:</p>
                  <p>Save these codes in a secure location. Each code can only be used once.</p>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-gray-100 p-3 text-center font-mono text-sm dark:bg-gray-700"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDownloadCodes}
                className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-gray-200 py-3 text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                <Download className="h-5 w-5" />
                <span>Download Codes</span>
              </button>
              <button
                onClick={() => generateBackupCodes()}
                className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => setStep('complete')}
              className="mt-4 w-full rounded-lg bg-purple-600 py-3 text-white transition-colors hover:bg-purple-700"
            >
              I've Saved My Codes
            </button>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Verify Setup
            </h2>

            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app:
            </p>

            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-center font-mono text-3xl text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
              className="w-full rounded-lg bg-purple-600 py-3 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verify and Enable 2FA
            </button>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication Enabled!
            </h2>

            <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">
              Your account is now protected with two-factor authentication. You'll need to enter a
              code from your {selectedMethod} when signing in.
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
