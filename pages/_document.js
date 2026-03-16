import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        <meta name="application-name" content="CantiereMobile" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CantiereMobile" />
        <meta name="description" content="Gestione trasporti di cantiere" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f1117" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
