import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            CoreFlow360
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            AI-First Multi-Industry CRM Platform
          </p>
          <p className="text-blue-200 max-w-2xl mx-auto">
            The world&apos;s most advanced AI-powered ERP system designed for HVAC, Construction, Healthcare, Legal, and Consulting industries.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center space-x-4 mb-16">
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/auth/signin"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">❄️ HVAC Services</h3>
            <p className="text-blue-100">
              Equipment tracking, maintenance scheduling, service history, and emergency dispatch for HVAC professionals.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">🤖 AI-Powered</h3>
            <p className="text-blue-100">
              Intelligent insights, predictive analytics, and automated workflows powered by industry-specific AI agents.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">🏢 Multi-Industry</h3>
            <p className="text-blue-100">
              One platform that adapts to HVAC, Construction, Healthcare, Legal, and Consulting businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}