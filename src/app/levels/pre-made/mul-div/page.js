import PageLayout from "@/components/layout/PageLayout";

export const metadata = { title: "Mul & Div • Kiwi Num Slide" };

export default async function MulDiv({ searchParams }) {
  const backHref = searchParams?.backTo || "/levels/pre-made";
  
  return (
    <PageLayout 
      title="Multiplication & Division" 
      backHref={backHref}
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <div style={{ padding: 24, textAlign: 'center', fontSize: '18px', color: 'var(--text-primary)' }}>
        Multiplication & Division (WIP)
      </div>
    </PageLayout>
  );
}
