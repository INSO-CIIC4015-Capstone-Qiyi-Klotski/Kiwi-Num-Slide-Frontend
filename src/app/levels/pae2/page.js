import MenuButton from '@/components/MenuButton';
import MenuPageLayout from '@/components/layout/MenuPageLayout';

export const metadata = { title: 'Levels • Kiwi Num Slide' };

export default function LevelsMenuPae2() {
  return (
    <MenuPageLayout 
      title="Levels" 
      backHref="/" 
      buttonWidth="clamp(350px, 30vw, 500px)"
      buttonWidthTablet="clamp(300px, 28vw, 450px)"
      buttonWidthMobile="clamp(250px, 25vw, 300px)"
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <MenuButton href='/levels/pre-made'>
        Pre-Made Levels
      </MenuButton>

      <MenuButton href='/levels/browse'>
        Browse Creator Levels
      </MenuButton>

      <MenuButton href='/levels/create'>
        Create Level
      </MenuButton>
    </MenuPageLayout>
  );
}
