import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { WalletButton } from "@/components/wallet/WalletButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZKX OMA POC",
  description: "Order Management Account Proof of Concept",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <WalletProvider>
            <div className="min-h-screen flex flex-col">
              {/* Navigation Header */}
              <header className="bg-surface border-b border-border">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-primary">
                          ZKX OMA
                        </Link>
                      </div>
                      <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <Link
                          href="/"
                          className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/intents"
                          className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                        >
                          Intents
                        </Link>
                        <Link
                          href="/policies"
                          className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                        >
                          Policies
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ThemeToggle />
                      <WalletButton />
                      <Link
                        href="/intents/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-opacity"
                      >
                        Create Intent
                      </Link>
                    </div>
                  </div>
                </nav>
              </header>

              {/* Main Content */}
              <main className="flex-grow bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>

              {/* Footer */}
              <footer className="bg-surface border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <p className="text-center text-sm text-muted-foreground">
                    ZKX OMA Proof of Concept - Trade Intent Management System
                  </p>
                </div>
              </footer>
            </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
