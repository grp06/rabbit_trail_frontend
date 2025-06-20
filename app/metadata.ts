import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shallow Research - AI-Powered Research & Discovery',
  description:
    'Dive into fascinating rabbit holes with intelligent follow-up questions. Shallow Research helps you explore topics broadly rather than deeply, discovering unexpected connections and intriguing tangents.',
  keywords: [
    'AI research',
    'intelligent search',
    'discovery',
    'learning',
    'exploration',
    'rabbit holes',
    'curiosity',
  ],
  authors: [{ name: 'Shallow Research' }],
  creator: 'Shallow Research',
  publisher: 'Shallow Research',

  // Open Graph tags for social media
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shallowresearch.app', // Update this to your actual domain
    siteName: 'Shallow Research',
    title: 'Shallow Research - AI-Powered Research & Discovery',
    description:
      'Dive into fascinating rabbit holes with intelligent follow-up questions. Explore topics broadly rather than deeply, discovering unexpected connections and intriguing tangents.',
    images: [
      {
        url: '/mag-glass.png',
        width: 1200,
        height: 630,
        alt: 'Shallow Research - AI-Powered Research & Discovery',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    site: '@shallowresearch', // Update this to your Twitter handle if you have one
    creator: '@shallowresearch', // Update this to your Twitter handle
    title: 'Shallow Research - AI-Powered Research & Discovery',
    description:
      'Dive into fascinating rabbit holes with intelligent follow-up questions. Perfect for curious minds who love exploring tangents.',
    images: ['/mag-glass.png'],
  },

  // Additional metadata
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1e1e' },
  ],

  // App-specific metadata
  applicationName: 'Shallow Research',
  referrer: 'origin-when-cross-origin',

  // Prevent indexing if this is still in development
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
