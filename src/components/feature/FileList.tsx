import { useUppyState } from "@/app/dashboard/useUppyState";
import { cn } from "@/lib/utils";
import { trpcClientReact, trpcPureClient } from "@/utils/api";
import Uppy from "@uppy/core";
import Image from "next/image";
import { useEffect, useState } from "react";
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

            const isImage = file?.data.type.startsWith("image");

            const url = URL.createObjectURL(file?.data);

            return (
              <div
                key={file.id}
                className="w-56 h-56 flex justify-center items-center border border-red-500"
              >
                {isImage ? (
                  <img src={url} alt={file.name} />
                ) : (
                  <Image
                    src="/unknown-file-types.png"
                    alt="unknown file type"
                    width={100}
                    height={100}
                  />
                )}
              </div>
            );
          })}

        {fileList?.map((file) => {
          const isImage = file.contentType.startsWith("image");
          return (
            <div
              key={file.id}
              className="w-56 h-56 flex justify-center items-center border"
            >
              {isImage ? (
                <img src={file.url} alt={file.name}></img>
              ) : (
                <Image src="" width={100} height={100} alt=""></Image>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
