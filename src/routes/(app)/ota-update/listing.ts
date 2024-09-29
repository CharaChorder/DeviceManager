export type Listing = FileListing | DirectoryListing;

export interface DirectoryListing {
  name: string;
  type: "directory";
  mtime: string;
}

export interface FileListing {
  name: string;
  type: "file";
  mtime: string;
  size: number;
}
