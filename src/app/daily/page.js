import Hud from '../../components/Hud';
import Board from '../../components/Board';
import styles from './page.module.css';

export const dynamic = 'force-static';
export const metadata = { title: 'Daily • Kiwi Num Slide' };

export default function DailyPage() {
  return (
    <section className={styles.wrapper}>
      <Hud showBack backHref='/' />
      <h1 className='brand' style={{ textAlign: 'center', marginTop: 8 }}>Daily</h1>
      <Board />
    </section>
  );
}
