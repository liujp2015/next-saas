import { useUppyState } from "@/app/dashboard/useUppyState";
import { cn } from "@/lib/utils";
import { trpcClientReact, trpcPureClient } from "@/utils/api";
import Uppy from "@uppy/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileItem, LocalFileItem, RemoteFileItem } from "./FileItem";
export function FileList({ uppy }: { uppy: Uppy }) {
  const { data: fileList, isPending } =
    trpcClientReact.file.listFiles.useQuery();
  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  const utils = trpcClientReact.useUtils();

  useEffect(() => {
    const handler = (file, resp) => {
      if (file) {
        trpcPureClient.file.saveFile
          .mutate({
            name: file.data instanceof File ? file.data.name : "test",
            path: resp.uploadURL ?? "",
            type: file.data.type,
          })
          .then((resp) => {
            utils.file.listFiles.setData(void 0, (prev) => {
              if (!prev) {
                return prev;
              }
              return [resp, ...prev];
            });
          });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadProgressHandler = (file, progress) => {
      console.log(file, progress);
      setUploadingFileIDs((currentFiles) => [...currentFiles, progress[0].id]);
    };

    const completeHandler = () => {
      setUploadingFileIDs([]);
    };
    uppy.on("upload", uploadProgressHandler);
    uppy.on("upload-success", handler);
    uppy.on("complete", completeHandler);

    return () => {
      uppy.off("upload-success", handler);
      uppy.off("upload", uploadProgressHandler);
      uppy.off("complete", completeHandler);
    };
  }, [uppy, utils]);

  return (
    <>
      {isPending && <div>Loading</div>}

      <div className={cn("flex flex-wrap gap-4 relative")}>
        {uploadingFileIDs.length > 0 &&
          uploadingFileIDs.map((id) => {
            const file = uppyFiles[id];

            return (
              <div
                key={file.id}
                className="w-56 h-56 flex justify-center items-center border border-red-500"
              >
                <LocalFileItem file={file.data as File}></LocalFileItem>
              </div>
            );
          })}

        {fileList?.map((file) => {
          return (
            <div
              key={file.id}
              className="w-56 h-56 flex justify-center items-center border"
            >
              <RemoteFileItem
                contentType={file.contentType}
                url={file.url}
                name={file.name}
              ></RemoteFileItem>
            </div>
          );
        })}
      </div>
    </>
  );
}
