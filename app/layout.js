import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PrivacyProvider } from "@/components/privacy/PrivacyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lunasin.id — Lunasi Hutang Lebih Cepat & Terarah",
  description: "Aplikasi web untuk mengelola dan melunasi hutang dengan strategi Snowball, Avalanche, atau Smart Priority.",
};

// Script untuk apply theme SEBELUM hydrate, mencegah FOUC (flash of unstyled content)
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('lunasin-theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <PrivacyProvider>
            {children}
          </PrivacyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
