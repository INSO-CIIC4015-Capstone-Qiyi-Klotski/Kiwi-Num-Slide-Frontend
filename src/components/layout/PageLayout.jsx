import PageWrapper from "@/components/PageWrapper";
import BackButton from "@/components/BackButton";
import appStyles from "../../app/page.module.css";

export default function PageLayout({ 
  title, 
  backHref, 
  children, 
  showBackButton = true,
  className = "",
  titleFontSize = "clamp(32px, 8vw, 120px)",
  titleFontSizeTablet = "clamp(28px, 8vw, 60px)",
  titleFontSizeMobile = "clamp(40px, 10vw, 80px)"
}) {
  return (
    <PageWrapper>
      {showBackButton && <BackButton href={backHref} />}
      <div className={`${appStyles.contentContainer} ${className}`} style={{
        '--title-font-size': titleFontSize,
        '--title-font-size-tablet': titleFontSizeTablet,
        '--title-font-size-mobile': titleFontSizeMobile
      }}>
        {title && (
          <h1 className={appStyles.title}>
            {title}
          </h1>
        )}
        {children}
      </div>
    </PageWrapper>
  );
}
