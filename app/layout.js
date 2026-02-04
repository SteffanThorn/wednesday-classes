// Import font packages from Next.js Google Fonts
import { Geist, Geist_Mono } from "next/font/google";
// Geist and Geist_Mono are modern sans-serif and monospace fonts

// Import global CSS styles (includes Tailwind CSS)
import "./globals.css";

// Import Language Provider for i18n support
import { LanguageProvider } from "@/hooks/useLanguage";

// Configure Geist Sans font - used throughout the app
const geistSans = Geist({
  variable: "--font-geist-sans",  // CSS variable name for the font
  subsets: ["latin"],             // Character set to load
});

// Configure Geist Mono font - used for code/monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata - SEO information for the page
export const metadata = {
  title: "Inner Light Yoga | Find Your Inner Light",
  description: "Where ancient wisdom meets modern healing, discover the transformative power of mindful movement in the heart of New Zealand.", // Description for search engines
};

/**
 * RootLayout - The main layout component that wraps all pages
 * This is a server component by default in Next.js 13+
 * 
 * @param {React.ReactNode} children - The page content to display
 */
export default function RootLayout({ children }) {
  return (
    // HTML document structure with English language
    <html lang="en">
      {/* Body element - applies fonts and smooth text rendering */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Language Provider for i18n support */}
        <LanguageProvider>
          {/* All page content is rendered here */}
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
