'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Application Error</CardTitle>
          <CardDescription>
            A server-side exception has occurred
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
            <p className="text-sm text-red-800 mb-2">
              <strong>Message:</strong> {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-sm text-red-800 mb-2">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-red-900 mb-2">
                  Stack Trace
                </summary>
                <pre className="text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto max-h-64">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Common Fixes:</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Check Vercel Dashboard → Settings → Environment Variables</li>
              <li>Verify DATABASE_URL is set correctly</li>
              <li>Verify NEXTAUTH_SECRET is set</li>
              <li>Verify NEXTAUTH_URL matches your Vercel URL exactly</li>
              <li>Check Vercel Runtime Logs for detailed error messages</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              If this error persists, check the Vercel Dashboard → Deployments → Latest → Runtime Logs
              for detailed error information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
