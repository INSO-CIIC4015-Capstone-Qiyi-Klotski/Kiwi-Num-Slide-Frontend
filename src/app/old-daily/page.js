import SlidingPuzzle from '../../components/Puzzle/SlidingPuzzle';
import PageLayout from "@/components/layout/PageLayout";

export const dynamic = 'force-static';
export const metadata = { title: 'Daily • Kiwi Num Slide' };

export default function DailyPage() {
  return (
    <PageLayout 
      title="Daily" 
      backHref="/"
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <SlidingPuzzle />
    </PageLayout>
  );
}
