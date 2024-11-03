"use client";
import { Uppy } from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { useEffect, useState } from "react";
import { useUppyState } from "./useUppyState";
import { Button } from "@/components/Button";
import { trpcClientReact, trpcPureClient } from "@/utils/api";

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

  const { data: files, isPending } = trpcClientReact.file.listFiles.useQuery();

  return (
    <div className="h-screen flex justify-center items-center">
      {isPending && <div>Loading</div>}
      {fileList?.map((file) => {
        return <div key={file.id}>{file.name}</div>;
      })}

      {/* <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach((file) => {
              uppy.addFile({
                data: file,
                name: file.name, // Add the file's name
                type: file.type, // Optional: add file type for better metadata
              });
            });
          }
        }}
        multiple
      />
      {files.map((file) => {
        const url = URL.createObjectURL(file.data);
        return <img src={url} key={file.id} />;
      })}
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
      <div>{progress}</div> */}
    </div>
  );
}
