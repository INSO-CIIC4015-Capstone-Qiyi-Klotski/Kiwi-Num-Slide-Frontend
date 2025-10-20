import Hud from '../components/Hud';
import MenuButton from '../components/MenuButton';
import styles from './page.module.css';

export const metadata = { title: 'Kiwi Num Slide' };

export default function Home() {
  return (
    <section className={styles.wrapper}>
      <Hud />
      <h1 className='brand' style={{ textAlign: 'center', marginTop: 8 }}>Kiwi Num Slide</h1>

      <div style={{ display:'grid', gap:16, justifyContent:'center', marginTop: 24 }}>
        <MenuButton href='/daily' data-testid='btn-daily'>Daily</MenuButton>
        <MenuButton href='/levels/pae2'>Level Select</MenuButton>
      </div>
    </section>
  );
}
