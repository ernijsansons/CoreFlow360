'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-md text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Something went wrong!</h2>
            <button
              onClick={reset}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}