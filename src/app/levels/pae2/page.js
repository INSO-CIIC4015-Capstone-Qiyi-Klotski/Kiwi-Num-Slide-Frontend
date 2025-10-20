import Hud from '../../../components/Hud';
import MenuButton from '../../../components/MenuButton';
import styles from './page.module.css';

export const metadata = { title: 'Levels • Kiwi Num Slide' };

export default function LevelsMenuPae2() {
  return (
    <section className={styles.wrapper}>
      <Hud showBack backHref='/' />
      <div className={styles.stack}>
        <MenuButton href='/daily' data-testid='btn-daily'>Daily</MenuButton>

        <MenuButton href='/levels/pre-made'>
          <>Pre-Made<br/>Levels</>
        </MenuButton>

        <MenuButton href='/levels/browse'>
          <>Browse Creator<br/>Levels</>
        </MenuButton>

        <MenuButton href='/levels/create'>
          <>Create<br/>Level</>
        </MenuButton>
      </div>
    </section>
  );
}
