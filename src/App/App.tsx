import { useEffect } from 'react';
import styles from './App.module.scss';
import { Button } from '~/ui/Button';
import { notesApi } from '~/api/notes';

export function App() {
  useEffect(() => {
    notesApi.fetchNotes(null).then((res) => console.log(res));
  }, []);
  return (
    <div className={styles.App}>
      <Button>test</Button>
    </div>
  );
}
