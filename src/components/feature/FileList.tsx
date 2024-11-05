import { useUppyState } from "@/app/dashboard/useUppyState";
import { cn } from "@/lib/utils";
import { trpcClientReact, trpcPureClient } from "@/utils/api";
import Uppy from "@uppy/core";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FileItem, LocalFileItem, RemoteFileItem } from "./FileItem";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/trpc-middlewares/router";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";
import { type FilesOrderByColumn } from "@/server/routes/file";
import { CopyUrl, DeleteFile } from "./FileItemAction";
type FileResult = inferRouterOutputs<AppRouter>["file"]["listFiles"];

export function FileList({
  uppy,
  orderBy,
  appId,
}: {
  uppy: Uppy;
  orderBy: FilesOrderByColumn;
  appId: string;
}) {
  const queryKey = {
    limit: 3,
    orderBy,
    appId,
  };

  const {
    data: infinityQueryData,
    isPending,
    fetchNextPage,
  } = trpcClientReact.file.infinityQueryFiles.useInfiniteQuery(
    { ...queryKey },
    {
      getNextPageParam: (resp) => resp.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
  const filesList = infinityQueryData
    ? infinityQueryData.pages.reduce((result, page) => {
        return [...result, ...page.items];
      }, [] as FileResult)
    : [];

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
            appId,
          })
          .then((resp) => {
            utils.file.infinityQueryFiles.setInfiniteData(
              { ...queryKey },
              (prev) => {
                if (!prev) {
                  return prev;
                }
                return {
                  ...prev,
                  pages: prev.pages.map((page, index) => {
                    if (index === 0) {
                      return {
                        ...page,
                        items: [resp, ...page.items],
                      };
                    }
                    return page;
                  }),
                };
              }
            );
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

  // -----------------------> intersection
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      const observer = new IntersectionObserver(
        (e) => {
          console.log(e);
          if (e[0].intersectionRatio > 0.1) {
            fetchNextPage();
          }
        },
        {
          threshold: 0.1,
        }
      );

      observer.observe(bottomRef.current);
      const element = bottomRef.current;

      return () => {
        observer.unobserve(element);
        observer.disconnect();
      };
    }
  }, [fetchNextPage]);

  const handleFileDelete = (id: string) => {
    utils.file.infinityQueryFiles.setInfiniteData({ ...queryKey }, (prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        pages: prev.pages.map((page, index) => {
          if (index === 0) {
            return {
              ...page,
              items: page.items.filter((item) => item.id !== id),
            };
          }
          return page;
        }),
      };
    });
  };

  return (
    <>
      <ScrollArea className="h-full">
        {isPending && <div className=" text-center">Loading</div>}

        <div
          className={cn(
            " container flex flex-wrap  justify-center gap-4 relative"
          )}
        >
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

          {filesList?.map((file) => {
            return (
              <div
                key={file.id}
                className="w-56 h-56 flex justify-center items-center border relative"
              >
                <div className="inset-0 absolute bg-background/30 justify-center items-center flex opacity-0 hover:opacity-100 transition-all">
                  <CopyUrl url={file.url}></CopyUrl>

                  <DeleteFile
                    fileId={file.id}
                    onDeleteSuccess={handleFileDelete}
                  ></DeleteFile>
                </div>

                <RemoteFileItem
                  contentType={file.contentType}
                  id={file.id}
                  name={file.name}
                ></RemoteFileItem>
              </div>
            );
          })}
        </div>
        <div
          className={cn(
            "flex justify-center p-8 hidden",
            filesList.length > 0 && "flex"
          )}
          ref={bottomRef}
        >
          <Button variant="ghost" onClick={() => fetchNextPage()}>
            Load Next Page
          </Button>
        </div>
      </ScrollArea>
    </>
  );
}
