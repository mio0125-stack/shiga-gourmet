import './globals.css'

export const metadata = {
  title: 'しがランチ',
  description: '滋賀のカフェ・レストランを1か所で',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
