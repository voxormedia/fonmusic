import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FonMusic — Легальная музыка для бизнеса",
  description: "Лицензионная фоновая музыка для ресторанов, кафе и магазинов в Узбекистане",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}