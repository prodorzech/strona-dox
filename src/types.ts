export interface Dox {
  id: string;
  nick: string;
  shortDesc: string;
  fullDesc: string;
  tables: DoxTable[];
  images: string[];
}

export interface DoxTable {
  title: string;
  data: Record<string, string>;
}

export interface Creator {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar?: string;
}

export type TabType = 'doxes' | 'creators';
