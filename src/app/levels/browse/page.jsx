// src/app/levels/browse/page.jsx
import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelsBrowsePageClient from "@/components/levels/LevelsBrowsePageClient";

export const metadata = { title: "Browse Levels • Kiwi Num Slide" };

export default function LevelsBrowsePage() {
  return (
    <PageLayout
      title="Browse Levels"
      backHref="/levels/pae2"
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
