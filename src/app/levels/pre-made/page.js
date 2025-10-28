import MenuButton from "../../../components/MenuButton";
import MenuPageLayout from "@/components/layout/MenuPageLayout";

export const metadata = { title: "Pre-Made Levels • Kiwi Num Slide" };

export default function PreMadeLevels() {
  return (
    <MenuPageLayout 
      title="Pre-Made Levels" 
      backHref="/levels/pae2"
      buttonWidth="clamp(450px, 35vw, 600px)"
      buttonWidthTablet="clamp(400px, 32vw, 550px)"
      buttonWidthMobile="clamp(280px, 28vw, 320px)"
      titleFontSize="clamp(32px, 8vw, 120px)"
      titleFontSizeTablet="clamp(28px, 8vw, 60px)"
      titleFontSizeMobile="clamp(40px, 10vw, 80px)"
    >
      <MenuButton href="/levels/pre-made/add-sub">
        Addition and Subtraction
      </MenuButton>
      <MenuButton href="/levels/pre-made/mul-div">
        Multiplication and Division
      </MenuButton>
    </MenuPageLayout>
  );
}
