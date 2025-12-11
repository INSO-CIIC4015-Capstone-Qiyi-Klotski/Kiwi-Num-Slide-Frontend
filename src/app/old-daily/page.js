import SlidingPuzzle from '../../components/Puzzle/SlidingPuzzle';
import PageLayout from "@/components/layout/PageLayout";

export const metadata = { title: 'Daily • Kiwi Num Slide' };

export default async function DailyPage({ searchParams }) {
  const backHref = searchParams?.backTo || "/";
  
  return (
    <PageLayout 
      title="Daily" 
      backHref={backHref}
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <SlidingPuzzle />
    </PageLayout>
  );
}
