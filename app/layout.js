import { Exo_2 } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-exo2",
});

export const metadata = {
  title: "Ever Ready Engineers - Billing & Invoicing System",
  description: "GST Billing, Quotations, and Client Management System for Ever Ready Engineers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={exo2.className} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
