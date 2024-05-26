export type Delay = () => Promise<void>;

export interface Note {
  id: string;
  parentId: string | null;
  text: string;
}
