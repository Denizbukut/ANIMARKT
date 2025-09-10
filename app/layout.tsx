import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErudaLoader from './eruda-loader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ani Market - Prediction Markets',
  description: 'Bet on the outcomes of real-world events with prediction markets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ErudaLoader />
        {children}
      </body>
    </html>
  )
}
