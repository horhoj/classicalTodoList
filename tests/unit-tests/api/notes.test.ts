import { expect } from 'vitest';
import { NotesApi, makeGenerateId } from '~/api/notes';
import { GenerateId, Note } from '~/api/notes.types';

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
  const generateIdStub: GenerateId = () => 'new id';

  describe('fetchNotes method should work correctly', () => {
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
      const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
      expect(await notesApi.fetchNotes(parentId)).toEqual(expectData);
    });
  });

  describe('patchNotes method should work correctly', () => {
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
        const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
        await notesApi.patchNote(id, newText);
        expect(store).toEqual(expectStoreState);
      },
    );
  });

  describe('patchNotes method should work with the error "note not found"', () => {
    it('', async () => {
      const store = makeTestStore();
      const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
      expect(() =>
        notesApi.patchNote('unknown id', 'new test value'),
      ).rejects.toEqual(new Error(NotesApi.ERROR_PATCH_NOTE_NOT_FOUND));
    });
  });

  describe('addNotes method should work correctly', () => {
    interface TestItem {
      store: Note[];
      text: Note['text'];
      parentId: Note['parentId'];
      expectStore: Note[];
      generateId: GenerateId;
    }

    const makeTestItem = (
      id: Note['id'],
      parentId: Note['parentId'],
    ): TestItem => {
      const text = `new text ${id}`;
      const expectStore: Note[] = makeTestStore();
      expectStore.push({ id, parentId, text });

      return {
        store: makeTestStore(),
        generateId: () => id,
        parentId,
        text,
        expectStore,
      };
    };

    const testList: TestItem[] = [
      makeTestItem('11', null),
      makeTestItem('22', '1'),
      makeTestItem('33', '2'),
      makeTestItem('44', '3'),
      makeTestItem('55', '4'),
    ];

    it.each(testList)(
      'each',
      async ({ expectStore, generateId, parentId, store, text }) => {
        const notesApi = new NotesApi(store, makeFakeDelay(), generateId);
        await notesApi.addNote(parentId, text);
        expect(store).toEqual(expectStore);
      },
    );
  });

  it('patchNotes method should work with the error "parent note not found"', async () => {
    const store = makeTestStore();
    const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
    expect(() =>
      notesApi.addNote('unknown id', 'new test value'),
    ).rejects.toEqual(new Error(NotesApi.ERROR_ADD_NOTE_PARENT_NOT_FOUND));
  });

  describe('deleteNote should work correctly', () => {
    it('deleteNote should work correctly 1', async () => {
      const store = makeTestStore();
      const expectStore: Note[] = [makeTestStore()[0], makeTestStore()[1]];
      const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
      await notesApi.deleteNote('3');
      expect(store).toEqual(expectStore);
    });

    it('deleteNote should work correctly 2', async () => {
      const store = makeTestStore();
      const expectStore: Note[] = [makeTestStore()[0]];
      const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
      await notesApi.deleteNote('2');
      expect(store).toEqual(expectStore);
    });
  });

  it('deleteNotes method should work with the error "note not found"', async () => {
    const store = makeTestStore();
    const notesApi = new NotesApi(store, makeFakeDelay(), generateIdStub);
    expect(() => notesApi.deleteNote('unknown id')).rejects.toEqual(
      new Error(NotesApi.ERROR_DELETE_NOTE_NOT_FOUND),
    );
  });
});

describe('makeGenerateId', () => {
  it.each([5, 13, 16, 18])('each', (startId) => {
    const generateId = makeGenerateId(startId);
    expect(generateId()).toBe((startId + 1).toString());
    expect(generateId()).toBe((startId + 2).toString());
    expect(generateId()).toBe((startId + 3).toString());
  });
});
