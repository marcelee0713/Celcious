import "./globals.css";
import { Roboto } from "next/font/google";
import { Providers } from "@/components/Providers";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Celcious",
  description: "A Small Clothing Line Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-screen max-w-full">
      <body className={`${roboto.className} h-full bg-secondary`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
