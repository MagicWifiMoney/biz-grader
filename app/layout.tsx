import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BizGrader — Free Small Business Website Report',
  description: 'Get a free instant grade for your business website. SEO, speed, mobile, local presence — scored in 60 seconds.',
  openGraph: {
    title: 'BizGrader — Free Small Business Website Report',
    description: 'Get a free instant grade for your business website. Scored in 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080810] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
