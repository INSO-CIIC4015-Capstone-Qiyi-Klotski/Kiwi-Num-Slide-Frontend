import PageWrapper from "@/components/PageWrapper";
import TutorialButton from "@/components/TutorialButton";
import appStyles from "../../app/page.module.css";

export default function HomePageLayout({ children }) {
  return (
    <PageWrapper>
      <TutorialButton />
      <div className={appStyles.contentContainer} style={{ 
        '--button-width': 'clamp(280px, 25vw, 400px)',
        '--button-width-tablet': 'clamp(250px, 22vw, 350px)',
        '--button-width-mobile': 'clamp(200px, 18vw, 280px)'
      }}>
        <div className={appStyles.titleContainer}>
          <h1 className={appStyles.title}>Kiwi</h1>
          <h1 className={appStyles.title}>Num</h1>
          <h1 className={appStyles.title}>Slide</h1>
        </div>
        <div className={appStyles.stack}>
          {children}
        </div>
      </div>
    </PageWrapper>
  );
}
