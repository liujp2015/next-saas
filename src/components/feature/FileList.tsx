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
type FileResult = inferRouterOutputs<AppRouter>["file"]["listFiles"];

export function FileList({ uppy }: { uppy: Uppy }) {
  const {
    data: infinityQueryData,
    isPending,
    fetchNextPage,
  } = trpcClientReact.file.infinityQueryFiles.useInfiniteQuery(
    { limit: 3 },
    {
      getNextPageParam: (resp) => resp.nextCursor,
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
          })
          .then((resp) => {
            utils.file.infinityQueryFiles.setInfiniteData(
              { limit: 10 },
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

  return (
    <>
      <ScrollArea className="h-full">
        {isPending && <div>Loading</div>}

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
