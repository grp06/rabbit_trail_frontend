'use client'

import StyledComponentsRegistry from './lib/registry'
import { createGlobalStyle } from 'styled-components'
import { Space_Grotesk } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #1e1e1e;
    color: #e0e0e0;
    font-family: var(--font-space-grotesk), 'Comic Sans MS', 'Comic Sans', cursive, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <StyledComponentsRegistry>
        <GlobalStyle />
        <body>{children}</body>
        <GoogleAnalytics gaId="G-VSR6SDJ4J5" />
      </StyledComponentsRegistry>
    </html>
  )
}
