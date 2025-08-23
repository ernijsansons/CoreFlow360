import V0Navigation from '@/components/marketing/V0Navigation'
import V0Hero from '@/components/marketing/V0Hero'
import V0Pricing from '@/components/marketing/V0Pricing'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <V0Hero />
      <V0Pricing />
      
      {/* Additional sections coming soon */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ✅ Real v0-CoreFlow360 Design Integrated!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Now using the actual v0 design components with proper branding and features
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">✅ Real v0 Navigation</h3>
              <p className="text-gray-400">Multi-business portfolio, industries dropdown</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">✅ Empire Hero Section</h3>
              <p className="text-gray-400">Live stats, multi-business messaging</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-pink-400 mb-2">✅ Progressive Pricing</h3>
              <p className="text-gray-400">Forever Free, Growth, Empire, Enterprise tiers</p>
            </div>
          </div>
          
          <div className="mt-8 text-gray-400">
            <p>🔄 Coming next: ROI Calculator, Success Stories, Industry Pages, AI Features</p>
          </div>
        </div>
      </section>
    </main>
  )
}
