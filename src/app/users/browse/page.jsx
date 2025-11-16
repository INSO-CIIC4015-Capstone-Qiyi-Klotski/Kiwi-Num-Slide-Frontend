// src/app/users/browse/page.jsx
import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import UsersBrowsePageClient from "@/components/users/UsersBrowsePageClient";

export const metadata = { title: "Browse Users • Kiwi Num Slide" };

export default function UsersBrowsePage() {
  return (
    <PageLayout
      title="Browse Users"
      backHref="/"
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <Suspense
        fallback={
          <div style={{ padding: 16, fontSize: 14 }}>
            Cargando filtros y usuarios…
          </div>
        }
      >
        <UsersBrowsePageClient />
      </Suspense>
    </PageLayout>
  );
}
