"use client";
import { Uppy } from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { useEffect, useState } from "react";
import { useUppyState } from "./useUppyState";
import { Button } from "@/components/ui/Button";
import { trpcClientReact, trpcPureClient } from "@/utils/api";
import { UploadButton } from "@/components/feature/UploadButton";
import Image from "next/image";
import { Dropzone } from "@/components/feature/Dropzone";
import { cn } from "../lib/utils";
import { usePasteFile } from "@/hooks/usePasteFile";
import { UploadPreview } from "@/components/feature/UploadPreview";

export default function Dashboard() {
  const [uppy] = useState(() => {
    const uppy = new Uppy();
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      getUploadParameters(file) {
        console.log(file);
        return trpcPureClient.file.createPresignedUrl.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size ?? 0,
        });
      },
    });
    return uppy;
  });
  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  const { data: fileList, isPending } =
    trpcClientReact.file.listFiles.useQuery();

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

    const uploadProgressHandler = (data) => {
      setUploadingFileIDs((currentFiles) => [...currentFiles, ...data.fileIDs]);
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
  }, [uppy]);

  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(
        files.map((file) => ({
          data: file,
          name: file.name,
        }))
      );
    },
  });
  return (
    <div className="container mx-auto p-2">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => {
            if (uppy) {
              uppy.upload().then((result: any) => {
                if (result.failed.length > 0) {
                  console.error("Upload failed:", result.failed);
                } else {
                  console.log("Upload successful:", result.successful);
                }
              });
            }
          }}
        >
          Upload
        </Button>
        <UploadButton uppy={uppy}></UploadButton>
      </div>
      {isPending && <div>Loading</div>}
      <Dropzone uppy={uppy}>
        {(dragging) => {
          return (
            <div
              className={cn(
                "flex flex-wrap gap-4 relative",
                dragging && "border border-dashed"
              )}
            >
              {dragging && (
                <div className="absolute inset-0 bg-secondary/30 flex justify-center items-center text-3xl">
                  Drop File Here to Upload
                </div>
              )}

              {uploadingFileIDs.length > 0 &&
                uploadingFileIDs.map((id) => {
                  const file = uppyFiles[id];

                  const isImage = file.data.type.startsWith("image");

                  const url = URL.createObjectURL(file.data);

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
          );
        }}
      </Dropzone>
      <UploadPreview uppy={uppy}></UploadPreview>
    </div>
  );
}
