import { Geist, Geist_Mono } from "next/font/google";
import { Bungee } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Fuente de marca
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
        style={{
          margin: 0,
          fontFamily: "var(--font-geist-sans)",
          backgroundColor: "#f9fafb",
          color: "#111",
        }}
      >
        <header
          style={{
            background: "#ec4899", // rosita
            color: "#fff",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.6rem",
              color: "#fff",
              fontFamily: "var(--font-kiwi), system-ui, sans-serif", // aplica Bungee
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            Kiwi Num Slide
          </h1>

          <nav>
            <a href="/" style={{ marginRight: 20, color: "#fff", textDecoration: "none" }}>
              Inicio
            </a>
            <a href="/play" style={{ marginRight: 20, color: "#fff", textDecoration: "none" }}>
              Jugar
            </a>
            <a href="/about" style={{ color: "#fff", textDecoration: "none" }}>
              Acerca de
            </a>
          </nav>
        </header>

        <main style={{ padding: "2rem" }}>{children}</main>

        <footer
          style={{
            background: "#e2e8f0",
            padding: "1rem 2rem",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          © {new Date().getFullYear()} Kiwi Num Slide – Proyecto Capstone
        </footer>
      </body>
    </html>
  );
}
