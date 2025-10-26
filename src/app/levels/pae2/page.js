import PageWrapper from '@/components/PageWrapper';
import MenuButton from '@/components/MenuButton';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';
import appStyles from '../../page.module.css';

export const metadata = { title: 'Levels • Kiwi Num Slide' };

export default function LevelsMenuPae2() {
  return (
    <PageWrapper>
      <BackButton href="/" />
      <div className={appStyles.contentContainer}>
        <h1 className={appStyles.title}>
          Levels
        </h1>
        <div className={styles.stack}>
          <MenuButton href='/levels/pre-made'>
            Pre-Made Levels
          </MenuButton>

          <MenuButton href='/levels/browse'>
            Browse Creator Levels
          </MenuButton>

          <MenuButton href='/levels/create'>
            Create Level
          </MenuButton>
        </div>
      </div>
    </PageWrapper>
  );
}
