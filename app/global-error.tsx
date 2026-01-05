'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            backgroundColor: 'white',
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Application Error
            </h1>
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              padding: '1rem',
              marginBottom: '1rem',
            }}>
              <p style={{ color: '#991b1b', marginBottom: '0.5rem' }}>
                <strong>Error:</strong> {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </div>
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '0.375rem',
              padding: '1rem',
              marginBottom: '1rem',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'semibold', marginBottom: '0.5rem', color: '#92400e' }}>
                Common Fixes:
              </h2>
              <ul style={{ color: '#78350f', fontSize: '0.875rem', listStyle: 'disc', paddingLeft: '1.5rem' }}>
                <li>Check Vercel Dashboard → Settings → Environment Variables</li>
                <li>Verify DATABASE_URL is set correctly</li>
                <li>Verify NEXTAUTH_SECRET is set</li>
                <li>Verify NEXTAUTH_URL matches your Vercel URL exactly</li>
              </ul>
            </div>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                marginRight: '0.5rem',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'white',
                color: '#374151',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
