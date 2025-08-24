import V0Navigation from '@/components/marketing/V0Navigation'
import V0DemoBooking from '@/components/marketing/V0DemoBooking'

export default function ScheduleDemoPage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <div className="pt-16">
        <V0DemoBooking />
      </div>
    </main>
  )
}