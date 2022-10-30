
export type Nullable<T> = T | null | undefined

export interface ChangeSummary {
  addLines: number
  deleteLines: number
}

export enum ElType {
  FILE = 'file',
  SUMMARY = 'summary',
}
