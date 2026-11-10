// Import font packages from Next.js Google Fonts
import { Geist, Geist_Mono } from "next/font/google";
// Geist and Geist_Mono are modern sans-serif and monospace fonts
import Script from "next/script";

// Import global CSS styles (includes Tailwind CSS)
import "./globals.css";

// Import Language Provider for i18n support
import { LanguageProvider } from "@/hooks/useLanguage";

// Import Auth Provider for next-auth
import { AuthProvider } from "@/components/AuthProvider";

// Import Background Music Player
import BackgroundMusic from "@/components/BackgroundMusic";

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
      <head>
        {/*
          Browser page translation (e.g. Chrome on iPhone translating to Chinese) swaps
          the page's text nodes for its own. React then fails to find nodes it is
          updating and the page crashes with "NotFoundError". This guard makes those
          two DOM calls skip nodes the translator has already moved, instead of throwing.
          See https://github.com/facebook/react/issues/11538
        */}
        <Script
          id="translate-dom-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (typeof Node !== "function" || !Node.prototype) return;
                var originalRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function (child) {
                  if (child && child.parentNode !== this) return child;
                  return originalRemoveChild.apply(this, arguments);
                };
                var originalInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function (newNode, referenceNode) {
                  if (referenceNode && referenceNode.parentNode !== this) return newNode;
                  return originalInsertBefore.apply(this, arguments);
                };
              })();
            `,
          }}
        />
        {process.env.NODE_ENV === "development" ? (
          <Script
            id="dev-extension-ethereum-guard"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  function isKnownExtensionEthereumError(message, source) {
                    if (!message) return false;
                    var msg = String(message);
                    var src = String(source || "");
                    return msg.indexOf("Cannot redefine property: ethereum") !== -1 && src.indexOf("chrome-extension://") !== -1;
                  }

                  window.addEventListener(
                    "error",
                    function (event) {
                      var message = event && (event.message || (event.error && event.error.message));
                      var source = event && (event.filename || (event.error && event.error.stack));
                      if (isKnownExtensionEthereumError(message, source)) {
                        event.preventDefault();
                        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                        console.warn("[dev-guard] Ignored extension ethereum injection conflict.");
                        return false;
                      }
                    },
                    true
                  );

                  window.addEventListener(
                    "unhandledrejection",
                    function (event) {
                      var reason = event && event.reason;
                      var message = reason && (reason.message || reason.toString());
                      var source = reason && reason.stack;
                      if (isKnownExtensionEthereumError(message, source)) {
                        event.preventDefault();
                        console.warn("[dev-guard] Ignored extension ethereum rejection conflict.");
                      }
                    },
                    true
                  );
                })();
              `,
            }}
          />
        ) : null}
      </head>
      {/* Body element - applies fonts and smooth text rendering */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Auth Provider for next-auth session */}
        <AuthProvider>
          {/* Language Provider for i18n support */}
          <LanguageProvider>
            {/* All page content is rendered here */}
            {children}
            {/* Background Music Player */}
            <BackgroundMusic />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
