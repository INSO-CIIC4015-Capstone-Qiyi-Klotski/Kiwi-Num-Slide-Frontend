import { Geist, Geist_Mono, Bungee } from "next/font/google";
import "./globals.css";
import Hud from "../components/Hud";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"] 
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"] 
});

const kiwiBrand = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kiwi",
});

export const metadata = {
  title: "Kiwi Num Slide",
  description: "Puzzle numérico estilo Klotski – Proyecto Capstone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kiwiBrand.variable}`}
        suppressHydrationWarning={true}
      >
        <header className="site-header">
          <Hud />
        </header>
        
        <main className="site-main" role="main" aria-label="Contenido principal">
          {children}
        </main>
        
        <footer className="site-footer">
          © {new Date().getFullYear()} Kiwi Num Slide – Proyecto Capstone
        </footer>
      </body>
    </html>
  );
}