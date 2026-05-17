import { useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker (no CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface UsePDFOptions {
  filePath: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  page: number;
  zoom: number;
  onPageCount: (n: number) => void;
}

export function usePDF({ filePath, canvasRef, page, zoom, onPageCount }: UsePDFOptions) {
  const docRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load document
  useEffect(() => {
    if (!filePath) return;

    // Convert Windows path to file URL
    const fileUrl = filePath.startsWith('/')
      ? `file://${filePath}`
      : `file:///${filePath.replace(/\\/g, '/')}`;

    const task = pdfjsLib.getDocument({ url: fileUrl, disableRange: false });
    task.promise
      .then(doc => {
        docRef.current = doc;
        onPageCount(doc.numPages);
      })
      .catch(e => console.error('PDF load error:', e));

    return () => {
      task.destroy();
      docRef.current?.destroy();
    };
  }, [filePath]);

  // Render page
  const renderPage = useCallback(async () => {
    if (!docRef.current || !canvasRef.current) return;

    // Cancel any ongoing render
    renderTaskRef.current?.cancel();

    try {
      const pdfPage = await docRef.current.getPage(page);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const viewport = pdfPage.getViewport({ scale: zoom * (window.devicePixelRatio || 1) });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1)}px`;
      canvas.style.height = `${viewport.height / (window.devicePixelRatio || 1)}px`;

      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') {
        console.error('PDF render error:', e);
      }
    }
  }, [page, zoom]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);
}
