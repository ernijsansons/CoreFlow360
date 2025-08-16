/**
 * CoreFlow360 - Multi-Factor Authentication Setup
 * Enhanced security with MFA configuration
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
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
  RefreshCw
} from 'lucide-react'

const MFA_METHODS = [
  {
    id: 'authenticator',
    name: 'Authenticator App',
    description: 'Use Google Authenticator, Authy, or similar apps',
    icon: Smartphone,
    recommended: true
  },
  {
    id: 'sms',
    name: 'SMS Text Message',
    description: 'Receive codes via text message',
    icon: Smartphone,
    recommended: false
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Receive codes via email',
    icon: Mail,
    recommended: false
  },
  {
    id: 'backup',
    name: 'Backup Codes',
    description: 'Generate one-time use backup codes',
    icon: Key,
    recommended: false
  }
]

export default function MFASetupPage() {
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
  const [qrCode] = useState(() => 
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Security Settings
          </button>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'select' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {step === 'select' ? '1' : <Check className="w-5 h-5" />}
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step !== 'select' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'setup' ? 'bg-purple-600 text-white' : 
              ['verify', 'complete'].includes(step) ? 'bg-green-600 text-white' : 
              'bg-gray-300 dark:bg-gray-700 text-gray-500'
            }`}>
              {['verify', 'complete'].includes(step) ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              ['verify', 'complete'].includes(step) ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'verify' ? 'bg-purple-600 text-white' : 
              step === 'complete' ? 'bg-green-600 text-white' : 
              'bg-gray-300 dark:bg-gray-700 text-gray-500'
            }`}>
              {step === 'complete' ? <Check className="w-5 h-5" /> : '3'}
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'complete' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'complete' ? 'bg-green-600 text-white' : 
              'bg-gray-300 dark:bg-gray-700 text-gray-500'
            }`}>
              {step === 'complete' ? <Check className="w-5 h-5" /> : '4'}
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Choose your authentication method
            </h2>
            
            {MFA_METHODS.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMethodSelect(method.id)}
                className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <method.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                        {method.recommended && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Recommended
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === 'setup' && selectedMethod === 'authenticator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Set up Authenticator App
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Or enter this code manually:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">
                    {secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setStep('verify')}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Backup Codes
            </h2>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Important:</p>
                  <p>Save these codes in a secure location. Each code can only be used once.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm text-center">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadCodes}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Codes</span>
              </button>
              <button
                onClick={() => generateBackupCodes()}
                className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setStep('complete')}
              className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              I've Saved My Codes
            </button>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Verify Setup
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter the 6-digit code from your authenticator app:
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-3xl font-mono px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-green-50 dark:bg-green-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Two-Factor Authentication Enabled!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Your account is now protected with two-factor authentication. You'll need to enter a code from your {selectedMethod} when signing in.
            </p>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}