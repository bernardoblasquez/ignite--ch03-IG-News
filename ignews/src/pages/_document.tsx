import Document, {Html, Head, Main, NextScript}  from 'next/document';

export default class MyDocument extends Document {
   render() {
      return(
         <Html lang="pt-br">
            <Head>
               <link rel="preconnect" href="https://fonts.googleapis.com" />
               <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
               <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300;400;500;600;700&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
               <link rel="shortcut icon" href="/favicon.png" type="image/png" />
            </Head>
            <body>
               <Main />
               <NextScript />
            </body>
         </Html>
      )
   }
}