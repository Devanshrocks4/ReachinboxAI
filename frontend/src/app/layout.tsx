import { ReactNode } from 'react'
import '../styles/globals.css'

export const metadata = {
  title: 'ReachinboxAI',
  description: 'Email scheduling platform',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
