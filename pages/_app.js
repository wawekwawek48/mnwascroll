// pages/_app.js
import Head from 'next/head';
import '../public/style.css'; // Menghubungkan CSS yang ada di public

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Manga Reader Hybrid</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
