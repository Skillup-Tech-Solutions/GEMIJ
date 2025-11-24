const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const buildServerUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${SERVER_URL}${encodeURI(path).replace(/,/g, '%2C')}`;
  }
  return `${SERVER_URL}/${encodeURI(path).replace(/,/g, '%2C')}`;
};

export const buildPdfUrl = (pdfPath: string): string => {
  return buildServerUrl(pdfPath);
};