import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${geist.variable} font-sans min-h-screen bg-slate-50 dark:bg-slate-950`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
