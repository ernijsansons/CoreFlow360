import V0Navigation from '@/components/marketing/V0Navigation'
import V0PortfolioManagement from '@/components/marketing/V0PortfolioManagement'
import V0Pricing from '@/components/marketing/V0Pricing'
import V0ROICalculator from '@/components/marketing/V0ROICalculator'

export default function PortfolioManagementPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <div className="pt-16">
        <V0PortfolioManagement />
        <V0ROICalculator />
        <V0Pricing />
      </div>
    </main>
  )
}