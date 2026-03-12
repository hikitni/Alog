import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_SC } from 'next/font/google';
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import BackgroundFX from "@/components/BackgroundFX";
import Sidebar from "@/components/Sidebar";
import SidebarDrawer from "@/components/SidebarDrawer";

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sc',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Alog — AI 工作日志",
  description: "AI 编程工具任务总结聚合平台",
};

// Inject before React hydrates to prevent FOUC
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('alog-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`antialiased ${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable}`}>
        <ThemeProvider>
          <BackgroundFX />
          <Header />
          <div className="alog-layout">
            <SidebarDrawer>
              <Sidebar />
            </SidebarDrawer>
            <main className="alog-main">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

