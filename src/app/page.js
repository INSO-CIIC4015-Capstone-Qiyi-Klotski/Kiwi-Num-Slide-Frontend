"use client";
import MenuButton from "../components/MenuButton";
import styles from "./page.module.css";

export default function Home() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.contentContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Kiwi</h1>
          <h1 className={styles.title}>Num</h1>
          <h1 className={styles.title}>Slide</h1>
        </div>
        <div className={styles.stack}>
          <MenuButton href="/daily" data-testid="btn-daily">
            Daily
          </MenuButton>
          <MenuButton href="/levels/pae2">
            Level Select
          </MenuButton>
        </div>
      </div>
    </section>
  );
}