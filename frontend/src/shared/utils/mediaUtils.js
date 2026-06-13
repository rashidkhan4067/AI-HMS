import { api as axiosInstance } from '../../lib/api';

/**
 * Resolves a backend path to a full media URL.
 * 
 * @param {string} path 
 * @returns {string}
 */
export const getMediaUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = axiosInstance.defaults.baseURL || 'http://127.0.0.1:8000/api/';
    const domain = base.replace(/\/api\/?.*$/, '');
    return `${domain}${path}`;
};

/**
 * Extracts the filename from a media URL.
 * 
 * @param {string} url 
 * @returns {string}
 */
export const getFilename = (url) => {
    if (!url) return 'document.pdf';
    return url.split('/').pop();
};
