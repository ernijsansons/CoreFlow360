'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">Error</h1>
        <p className="mb-8 text-xl text-gray-600">Something went wrong!</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}