import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="no-scrollbar overflow-x-clip">
      <body className="flex min-h-screen flex-col overflow-x-clip font-sans">{children}</body>
    </html>
  );
}
