// src/app/levels/browse/page.jsx
import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelsBrowsePageClient from "@/components/levels/LevelsBrowsePageClient";

export const metadata = { title: "Browse Levels • Kiwi Num Slide" };


export default async function LevelsBrowsePage({ searchParams }) {
  // Allow dynamic back navigation based on where the user came from
  const backHref = searchParams?.backTo || "/levels/pae2";
  
  return (
    <PageLayout
      title="Browse Levels"
      backHref={backHref}
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <Suspense
        fallback={
          <div style={{ padding: 16, fontSize: 14 }}>
            Cargando filtros y niveles…
          </div>
        }
      >
        <LevelsBrowsePageClient />
      </Suspense>
    </PageLayout>
  );
}
