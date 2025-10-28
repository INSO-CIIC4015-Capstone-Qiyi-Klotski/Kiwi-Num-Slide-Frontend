import PageLayout from "./PageLayout";
import appStyles from "../../app/page.module.css";

export default function MenuPageLayout({ 
  title, 
  backHref, 
  children, 
  showBackButton = true,
  className = "",
  buttonWidth = "100%",
  buttonWidthTablet = "100%",
  buttonWidthMobile = "100%",
  titleFontSize = "clamp(32px, 8vw, 120px)",
  titleFontSizeTablet = "clamp(28px, 8vw, 60px)",
  titleFontSizeMobile = "clamp(40px, 10vw, 80px)"
}) {
  return (
    <PageLayout 
      title={title} 
      backHref={backHref} 
      showBackButton={showBackButton}
      className={className}
      titleFontSize={titleFontSize}
      titleFontSizeTablet={titleFontSizeTablet}
      titleFontSizeMobile={titleFontSizeMobile}
    >
      <div className={appStyles.stack} style={{ 
        '--button-width': buttonWidth,
        '--button-width-tablet': buttonWidthTablet,
        '--button-width-mobile': buttonWidthMobile
      }}>
        {children}
      </div>
    </PageLayout>
  );
}
