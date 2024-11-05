"use client";
import { Uppy } from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { use, useEffect, useState } from "react";
import { useUppyState } from "../../useUppyState";
import { Button } from "@/components/ui/Button";
import { trpcClientReact, trpcPureClient } from "@/utils/api";
import { UploadButton } from "@/components/feature/UploadButton";
import Image from "next/image";
import { Dropzone } from "@/components/feature/Dropzone";
import { cn } from "../../../lib/utils";
import { usePasteFile } from "@/hooks/usePasteFile";
import { UploadPreview } from "@/components/feature/UploadPreview";
import { FileList } from "@/components/feature/FileList";
import { FilesOrderByColumn } from "@/server/routes/file";
import { MoveUp, MoveDown } from "lucide-react";
import Link from "next/link";

export default function AppPage({ params }) {
  const unwrappedParams = use(params); // 使用 React.use() 解包 params
  const appId = unwrappedParams; // 现在可以安全地访问 id
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
  const [orderBy, setOrderBy] = useState<
    Exclude<FilesOrderByColumn, undefined>
  >({
    field: "createdAt",
    order: "desc",
  });

  return (
    <div className=" mx-auto h-full">
      <div className=" container flex justify-between items-center h-[60px]">
        <Button
          onClick={() => {
            setOrderBy((current) => ({
              ...current,
              order: current?.order === "asc" ? "desc" : "asc",
            }));
          }}
        >
          Created At {orderBy.order === "desc" ? <MoveUp /> : <MoveDown />}
        </Button>

        <div className="flex justify-center gap-2">
          <UploadButton uppy={uppy}></UploadButton>
          <Button asChild>
            <Link href="/dashboard/apps/new">new app</Link>
          </Button>
        </div>

        <Link href="/dashboard/apps/new"> </Link>
      </div>

      <Dropzone uppy={uppy} className=" h-[calc(100% - 60px)] relative">
        {(dragging) => {
          return (
            <>
              {dragging && (
                <div className="absolute inset-0 bg-secondary/50 z-10 flex justify-center items-center text-3xl">
                  Drop File Here to Upload
                </div>
              )}

              <FileList uppy={uppy} orderBy={orderBy} appId={appId}></FileList>
            </>
          );
        }}
      </Dropzone>
      <UploadPreview uppy={uppy}></UploadPreview>
    </div>
  );
}
