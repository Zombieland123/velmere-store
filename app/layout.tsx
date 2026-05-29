import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="no-scrollbar overflow-x-clip antialiased [backface-visibility:hidden]">
      <body className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden font-sans antialiased">{children}</body>
    </html>
  );
}
