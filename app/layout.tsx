'use client'

import StyledComponentsRegistry from './lib/registry'
import { createGlobalStyle } from 'styled-components'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
    font-family: ${roboto.style.fontFamily}, sans-serif;
  }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <StyledComponentsRegistry>
        <GlobalStyle />
        <body>{children}</body>
      </StyledComponentsRegistry>
    </html>
  )
}
