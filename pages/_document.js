import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Global site tag (gtag.js) - Google Ads: 857052394 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-857052394"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', 'AW-857052394');
            `,
          }}
        />

        {/* Global site tag (gtag.js) - Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R0QS0BSSG1"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', 'G-R0QS0BSSG1');
            `,
          }}
        />

        {/* SiTEST */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function (PID) {
                var script = document.createElement("script");
                script.src = "https://tracking.sitest.jp/tag?p=" + PID + "&u=" + encodeURIComponent(location.origin + location.pathname + location.search);
                script.async = true;
                document.head.appendChild(script);
              })("p663c4537de394");
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
