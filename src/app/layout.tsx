import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Cartoon Generator — Type a prompt, get a 5-minute cartoon',
  description: 'Turn any story idea into a complete animated cartoon film with voices and music. Free, instant, no AI APIs.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased">{children}</body></html>
}
