import V0Navigation from '@/components/marketing/V0Navigation'
import V0About from '@/components/marketing/V0About'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <div className="pt-16">
        <V0About />
      </div>
    </main>
  )
}