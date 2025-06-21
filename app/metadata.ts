import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rabbit Trail - Follow Your Curiosity Down Endless Rabbit Holes',
  description:
    'Tumble down delightful rabbit holes with whimsical follow-up questions. Rabbit Trail turns every question into a playful journey of discovery, leading you through unexpected trails of wonder and connection.',
  keywords: [
    'AI curiosity',
    'discovery',
    'learning',
    'exploration',
    'rabbit holes',
    'rabbit trail',
    'wonderland',
    'whimsical learning',
  ],
  authors: [{ name: 'Rabbit Trail' }],
  creator: 'Rabbit Trail',
  publisher: 'Rabbit Trail',

  // Open Graph tags for social media
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rabbittrail.vercel.app', // Updated to match your actual domain
    siteName: 'Rabbit Trail',
    title: 'Rabbit Trail - Follow Your Curiosity Down Endless Rabbit Holes',
    description:
      'Tumble down delightful rabbit holes with whimsical follow-up questions. Turn every question into a playful journey through unexpected trails of wonder and connection.',
    images: [
      {
        url: 'https://rabbittrail.vercel.app/mag-glass.png',
        width: 1200,
        height: 630,
        alt: 'Rabbit Trail - Follow Your Curiosity Down Endless Rabbit Holes',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    site: '@rabbittrail', // Update this to your Twitter handle if you have one
    creator: '@rabbittrail', // Update this to your Twitter handle
    title: 'Rabbit Trail - Follow Your Curiosity Down Endless Rabbit Holes',
    description:
      'Tumble down delightful rabbit holes with whimsical questions. Perfect for curious minds who love wandering wonderful trails.',
    images: ['https://rabbittrail.vercel.app/mag-glass.png'],
  },

  // Additional metadata
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1e1e' },
  ],

  // App-specific metadata
  applicationName: 'Rabbit Trail',
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
