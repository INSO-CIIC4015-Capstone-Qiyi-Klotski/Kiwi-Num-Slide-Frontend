import Hud from "../../../components/Hud";
import MenuButton from "../../../components/MenuButton";
import styles from "./page.module.css";

export const metadata = { title: "Pre-Made Levels • Kiwi Num Slide" };

export default function PreMadeLevels() {
  return (
    <section className={styles.wrapper}>
      {/* Si tu menú principal está en /levels/pae2, usa backHref="/levels/pae2" */}
      <Hud showBack backHref="/levels/pae2" />

      <div className={styles.stack}>
        <MenuButton href="/levels/pre-made/add-sub">
          <>Addition and<br/>Subtraction</>
        </MenuButton>
        <MenuButton href="/levels/pre-made/mul-div">
          <>Multiplication<br/>and Division</>
        </MenuButton>
      </div>
    </section>
  );
}
