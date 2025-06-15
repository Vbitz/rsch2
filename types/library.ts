import { Paper } from './paper';

export interface Library {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  papers: Paper[];
}

export interface LibraryMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  paperCount: number;
}