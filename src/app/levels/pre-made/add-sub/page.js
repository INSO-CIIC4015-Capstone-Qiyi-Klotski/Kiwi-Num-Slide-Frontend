import PageLayout from "@/components/layout/PageLayout";

export const metadata = { title: "Add & Sub • Kiwi Num Slide" };

export default function AddSub() {
  return (
    <PageLayout 
      title="Addition & Subtraction" 
      backHref="/levels/pre-made"
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <div style={{ padding: 24, textAlign: 'center', fontSize: '18px' }}>
        Addition & Subtraction (WIP)
      </div>
    </PageLayout>
  );
}
