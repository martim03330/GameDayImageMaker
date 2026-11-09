import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { DATA_DIR } from "./db";

export const FILES_DIR = path.join(DATA_DIR, "files");

/** Stores an uploaded file under data/files/<folder>/ and returns its relative path. */
export async function saveUpload(file: File, folder: string): Promise<string> {
  const ext = (path.extname(file.name) || ".png").toLowerCase();
  const rel = path.posix.join(folder, `${nanoid(10)}${ext}`);
  const abs = path.join(FILES_DIR, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, Buffer.from(await file.arrayBuffer()));
  return rel;
}

export function absPath(rel: string): string {
  const abs = path.resolve(FILES_DIR, rel);
  if (!abs.startsWith(FILES_DIR + path.sep)) throw new Error("Caminho inválido");
  return abs;
}

/** Public URL (served by /api/files) for a stored file. */
export function fileUrl(rel: string | null | undefined): string | null {
  return rel ? `/api/files/${rel}` : null;
}
