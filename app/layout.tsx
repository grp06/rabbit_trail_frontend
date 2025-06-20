import StyledComponentsRegistry from './lib/registry'
import { Space_Grotesk } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { metadata as siteMetadata } from './metadata'

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

// Export metadata for Next.js
export const metadata = siteMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <head>{/* Additional meta tags if needed */}</head>
      <body>
        <StyledComponentsRegistry>
          {children}
          <GoogleAnalytics gaId="G-VSR6SDJ4J5" />
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
