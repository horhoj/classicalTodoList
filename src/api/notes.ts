import { NOTES_REQUEST_DELAY } from './const';
import { Delay, Note } from './notes.types';
import { delay } from '~/utils/delay';

const store: Note[] = [
  { id: '1', parentId: null, text: 'note 1' },
  { id: '2', parentId: null, text: 'note 2' },
  { id: '3', parentId: '2', text: 'note 3' },
  { id: '4', parentId: '3', text: 'note 4' },
  { id: '5', parentId: '4', text: 'note 5' },
  { id: '6', parentId: '4', text: 'note 6' },
];

export class NotesApi {
  public static ERROR_PATCH_NOTE_NOT_FOUND = 'note not found';
  private store: Note[];
  private delay: Delay;
  public constructor(store: Note[], delay: Delay) {
    this.store = store;
    this.delay = delay;
  }

  public async fetchNotes(parentId: Note['parentId']) {
    await this.delay();
    return this.store.filter((note) => note.parentId === parentId);
  }

  public async patchNote(id: Note['id'], text: Note['text']) {
    await this.delay();
    const index = this.store.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new Error(NotesApi.ERROR_PATCH_NOTE_NOT_FOUND);
    }
    this.store[index].text = text;
  }
}

export const notesApi = new NotesApi(store, () => delay(NOTES_REQUEST_DELAY));
