import V0Navigation from '@/components/marketing/V0Navigation'
import V0Hero from '@/components/marketing/V0Hero'
import V0Pricing from '@/components/marketing/V0Pricing'
import V0ROICalculator from '@/components/marketing/V0ROICalculator'
import V0SuccessStories from '@/components/marketing/V0SuccessStories'
import V0AIFeatures from '@/components/marketing/V0AIFeatures'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <V0Hero />
      <V0AIFeatures />
      <V0ROICalculator />
      <V0SuccessStories />
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
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            <div className="p-4 bg-gray-800 rounded-2xl text-center">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">✅ v0 Navigation</h3>
              <p className="text-gray-400 text-xs">Portfolio & Industries</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-2xl text-center">
              <h3 className="text-sm font-semibold text-purple-400 mb-1">✅ Empire Hero</h3>
              <p className="text-gray-400 text-xs">Live stats & messaging</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-2xl text-center">
              <h3 className="text-sm font-semibold text-cyan-400 mb-1">✅ AI Employees</h3>
              <p className="text-gray-400 text-xs">6 specialized AI workers</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-2xl text-center">
              <h3 className="text-sm font-semibold text-green-400 mb-1">✅ ROI Calculator</h3>
              <p className="text-gray-400 text-xs">Progressive discounts</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-2xl text-center">
              <h3 className="text-sm font-semibold text-yellow-400 mb-1">✅ Success Stories</h3>
              <p className="text-gray-400 text-xs">Real empire builders</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-2xl text-center">
              <h3 className="text-sm font-semibold text-pink-400 mb-1">✅ Pricing Tiers</h3>
              <p className="text-gray-400 text-xs">Free to Enterprise</p>
            </div>
          </div>
          
          <div className="mt-8 text-gray-400">
            <p>🔄 Coming next: Industry Pages (HVAC, Legal, Construction, Professional Services)</p>
          </div>
        </div>
      </section>
    </main>
  )
}
