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

  const files = useUppyState(uppy, (s) => Object.values(s.files));
  const progress = useUppyState(uppy, (s) => s.totalProgress);
  useEffect(() => {
    const handler = (file, resp) => {
      if (file) {
        trpcPureClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type,
        });
      }
    };

    uppy.on("upload-success", handler);

    return () => {
      uppy.off("upload-success", handler);
    };
  }, [uppy]);

  const { data: fileList, isPending } =
    trpcClientReact.file.listFiles.useQuery();

  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(
        files.map((file) => ({
          data: file,
        }))
      );
    },
  });
  return (
    <div className="container mx-auto p-2">
      <div>
        <UploadButton uppy={uppy}></UploadButton>

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
        <div>{progress}</div>
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

      {files.map((file) => {
        const url = URL.createObjectURL(file.data);
        return <img src={url} key={file.id} />;
      })}
      <div>{progress}</div>
    </div>
  );
}
