import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto, Raleway } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Leyline",
  description: "Leyline investor education, companies, and portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${raleway.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
