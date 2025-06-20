'use client'

import StyledComponentsRegistry from './lib/registry'
import { createGlobalStyle } from 'styled-components'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
})

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #1e1e1e;
    color: #e0e0e0;
    font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <StyledComponentsRegistry>
        <GlobalStyle />
        <body>{children}</body>
        <GoogleAnalytics gaId="G-VSR6SDJ4J5" />
      </StyledComponentsRegistry>
    </html>
  )
}
