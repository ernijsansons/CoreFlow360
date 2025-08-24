import V0Navigation from '@/components/marketing/V0Navigation'
import V0Enterprise from '@/components/marketing/V0Enterprise'

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-black">
      <V0Navigation />
      <div className="pt-16">
        <V0Enterprise />
      </div>
    </main>
  )
}