import Navigation from '@/components/marketing/Navigation'
import Hero from '@/components/marketing/Hero'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navigation />
      <Hero />
      
      {/* Coming Soon Sections */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            🚀 v0-CoreFlow360 Integration Complete!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Marketing UI successfully integrated with the main CoreFlow360 platform
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-violet-400 mb-2">✅ Navigation</h3>
              <p className="text-gray-400">Responsive navigation with auth integration</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">✅ Hero Section</h3>
              <p className="text-gray-400">Professional landing with CoreFlow360 branding</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">🔄 More Components</h3>
              <p className="text-gray-400">Features, ROI Calculator, Pricing coming next</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
