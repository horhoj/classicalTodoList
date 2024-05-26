import { expect } from 'vitest';
import { NotesApi } from '~/api/notes';
import { Note } from '~/api/notes.types';

describe('notes api tests', () => {
  const makeTestStore = (): Note[] => [
    { id: '1', parentId: null, text: 'note 1' },
    { id: '2', parentId: null, text: 'note 2' },
    { id: '3', parentId: '2', text: 'note 3' },
    { id: '4', parentId: '3', text: 'note 4' },
    { id: '5', parentId: '4', text: 'note 5' },
    { id: '6', parentId: '4', text: 'note 6' },
  ];
  const makeFakeDelay = () => () => Promise.resolve();

  describe('fetchNotes method', () => {
    interface TestItem {
      store: Note[];
      parentId: Note['parentId'];
      expectData: Note[];
    }

    const makeTestItem = (parentId: Note['parentId']): TestItem => ({
      store: makeTestStore(),
      parentId,
      expectData: makeTestStore().filter((el) => el.parentId === parentId),
    });

    const testList: TestItem[] = [null, '2', '3', '4'].map((parentId) =>
      makeTestItem(parentId),
    );

    it.each(testList)('each', async ({ store, parentId, expectData }) => {
      const notesApi = new NotesApi(store, makeFakeDelay());
      expect(await notesApi.fetchNotes(parentId)).toEqual(expectData);
    });
  });

  describe('patchNote method correct', () => {
    const patchStore = (
      store: Note[],
      id: Note['id'],
      text: Note['text'],
    ): Note[] =>
      store.map((note) => ({
        ...note,
        text: note.id === id ? text : note.text,
      }));

    interface TestItem {
      store: Note[];
      id: Note['id'];
      newText: Note['text'];
      expectStoreState: Note[];
    }

    const makeTestItem = (id: Note['id']): TestItem => ({
      store: makeTestStore(),
      id,
      newText: `new value ${id}`,
      expectStoreState: patchStore(makeTestStore(), id, `new value ${id}`),
    });

    const testList: TestItem[] = Array(6)
      .fill(null)
      .map((_, i) => makeTestItem((i + 1).toString()));

    it.each(testList)(
      'each',
      async ({ expectStoreState, id, newText, store }) => {
        const notesApi = new NotesApi(store, makeFakeDelay());
        await notesApi.patchNote(id, newText);
        expect(store).toEqual(expectStoreState);
      },
    );
  });
  describe('patchNote method incorrect', () => {
    it('', async () => {
      const store = makeTestStore();
      const notesApi = new NotesApi(store, makeFakeDelay());
      expect(() =>
        notesApi.patchNote('unknown id', 'new test value'),
      ).rejects.toThrowError(NotesApi.ERROR_PATCH_NOTE_NOT_FOUND);
    });
  });
});
