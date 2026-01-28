import { Inter } from "next/font/google"; // Switch back to clean Inter font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "FlowSaaS - Automate Workflows",
    description: "Personal SaaS Platform with n8n",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
                {children}
            </body>
        </html>
    );
}
