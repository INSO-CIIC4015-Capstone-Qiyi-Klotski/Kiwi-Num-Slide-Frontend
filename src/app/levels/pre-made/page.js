import PageWrapper from "@/components/PageWrapper";
import MenuButton from "../../../components/MenuButton";
import styles from "./page.module.css";
import appStyles from "../../page.module.css";
import BackButton from "@/components/BackButton";

export const metadata = { title: "Pre-Made Levels • Kiwi Num Slide" };

export default function PreMadeLevels() {
  return (
    <PageWrapper>
      <BackButton href="/levels/pae2" />
      <div className={appStyles.contentContainer}>
        <h1 className={appStyles.title}>
          Pre-Made Levels
        </h1>
        <div className={styles.stack}>
          <MenuButton href="/levels/pre-made/add-sub">
            Addition and Subtraction
          </MenuButton>
          <MenuButton href="/levels/pre-made/mul-div">
            Multiplication and Division
          </MenuButton>
        </div>
      </div>
    </PageWrapper>
  );
}
