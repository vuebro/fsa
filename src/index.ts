import type { StreamingBlobPayloadInputTypes } from "@smithy/types";

const getHandle = (
  Bucket: FileSystemDirectoryHandle,
  Key: string,
  create = false,
) =>
  Key
    ? Key.split("/").reduce(
        async (
          previousValue: Promise<
            FileSystemDirectoryHandle | FileSystemFileHandle | undefined
          >,
          currentValue,
          currentIndex,
          array,
        ) => {
          const handle = await previousValue;
          if (handle?.kind === "directory" && currentValue)
            try {
              return await handle.getDirectoryHandle(currentValue, { create });
            } catch {
              if (currentIndex === array.length - 1)
                try {
                  return await handle.getFileHandle(currentValue, {
                    create: false,
                  });
                } catch {
                  return;
                }
            }
          return;
        },
        Promise.resolve(Bucket),
      )
    : Promise.resolve(Bucket);

export const deleteObject = async (
    Bucket: FileSystemDirectoryHandle,
    Key: string,
  ) => {
    const keys = Key.split("/"),
      name = keys.pop();
    if (name) {
      const handle = await getHandle(Bucket, keys.join("/"));
      if (handle?.kind === "directory") await handle.removeEntry(name);
    }
  },
  getObjectBlob = async (Bucket: FileSystemDirectoryHandle, Key: string) => {
    const handle = await getHandle(Bucket, Key);
    if (handle?.kind === "file") return handle.getFile();
    else return new Blob();
  },
  getObjectText = async (Bucket: FileSystemDirectoryHandle, Key: string) =>
    (await getObjectBlob(Bucket, Key)).text(),
  headObject = async (Bucket: FileSystemDirectoryHandle, Key: string) => {
    const handle = await getHandle(Bucket, Key);
    if (handle?.kind === "file") return undefined;
    else throw new Error("It's not a file");
  },
  putObject = async (
    Bucket: FileSystemDirectoryHandle,
    Key: string,
    body: StreamingBlobPayloadInputTypes,
  ) => {
    const keys = Key.split("/"),
      name = keys.pop();
    if (name) {
      const handle = await getHandle(Bucket, keys.join("/"), true);
      if (handle?.kind === "directory") {
        const writable = await (
          await handle.getFileHandle(name, { create: true })
        ).createWritable();
        try {
          await writable.write(body as FileSystemWriteChunkType);
        } finally {
          await writable.close();
        }
      }
    }
  },
  removeEmptyDirectories = async (
    directory: FileSystemDirectoryHandle,
    exclude: string[],
  ) => {
    if (!exclude.includes(directory.name)) {
      const values = [];
      for await (const value of directory.values())
        if (value.kind === "directory") values.push(value);
      await Promise.all(
        values.map((value) =>
          removeEmptyDirectories(value as FileSystemDirectoryHandle, exclude),
        ),
      );
      await Promise.allSettled(
        values.map(({ name }) => directory.removeEntry(name)),
      );
    }
  };
