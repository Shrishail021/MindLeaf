import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Annotation } from '../types';

interface AnnotationStore {
  annotations: Annotation[];
  loadAnnotations: (bookId: number, pageNumber?: number) => Promise<void>;
  saveAnnotation: (params: {
    bookId: number;
    pageNumber: number;
    annotationType: string;
    selectedText?: string;
    color?: string;
    noteContent?: string;
    positionData: string;
  }) => Promise<Annotation>;
  deleteAnnotation: (id: number) => Promise<void>;
  updateNote: (id: number, noteContent: string) => Promise<void>;
  allHighlights: Annotation[];
  loadAllHighlights: () => Promise<void>;
}

export const useAnnotationStore = create<AnnotationStore>((set) => ({
  annotations: [],
  allHighlights: [],

  loadAnnotations: async (bookId, pageNumber) => {
    const annotations = await invoke<Annotation[]>('get_annotations', {
      bookId,
      pageNumber: pageNumber ?? null,
    });
    set({ annotations });
  },

  saveAnnotation: async (params) => {
    const a = await invoke<Annotation>('save_annotation', {
      bookId: params.bookId,
      pageNumber: params.pageNumber,
      annotationType: params.annotationType,
      selectedText: params.selectedText ?? null,
      color: params.color ?? null,
      noteContent: params.noteContent ?? null,
      positionData: params.positionData,
    });
    set(s => ({ annotations: [...s.annotations, a] }));
    return a;
  },

  deleteAnnotation: async (id) => {
    await invoke('delete_annotation', { id });
    set(s => ({ annotations: s.annotations.filter(a => a.id !== id) }));
  },

  updateNote: async (id, noteContent) => {
    await invoke('update_note_content', { id, noteContent });
    set(s => ({
      annotations: s.annotations.map(a =>
        a.id === id ? { ...a, note_content: noteContent } : a
      ),
    }));
  },

  loadAllHighlights: async () => {
    const allHighlights = await invoke<Annotation[]>('get_all_highlights');
    set({ allHighlights });
  },
}));
