/// <reference types="node" />
export type FileSystemUtil = {
    readFile: (path: string | Buffer | URL) => Promise<string | Buffer>;
    readdir: (path: string | Buffer | URL, options?: any) => Promise<(string | Buffer)[] | Dirent[]>;
};
type Dirent = {
    name: string | Buffer;
    isDirectory: () => boolean;
};
export declare const getAllLocales: (fs: FileSystemUtil, path: string, outputFormat: 'TypeScript' | 'JavaScript') => Promise<string[]>;
export {};
