/** One file under public/resources, as listed in the admin files panel. */
export interface ResourceFileEntry {
  /** Raw filename on disk (not percent-encoded). */
  name: string;
  /** Percent-encoded URL path, paste-ready for a resource's `files[].src` field. */
  path: string;
  /** File size in bytes. */
  size: number;
  /** ISO timestamp of the file's last modification (build-time snapshot). */
  modifiedAt: string;
}
