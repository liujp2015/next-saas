import { useUppyState } from "@/app/dashboard/useUppyState";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogFooter } from "../ui/Dialog";
import Image from "next/image";
import Uppy from "@uppy/core";
import { useState } from "react";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function UploadPreview({ uppy }: { uppy: Uppy }) {
  const files = useUppyState(uppy, (s) => Object.values(s.files));
  const open = files.length > 0;
  const [index, setIndex] = useState(0);

  const file = files[index];

  const isImage = file.data.type.startsWith("image");

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Upload Preview</DialogTitle>
        <div className="flex  items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (index === 0) {
                setIndex(files.length - 1);
              } else {
                setIndex(index - 1);
              }
            }}
          >
            <ChevronLeft />
          </Button>

          <div
            key={file.id}
            className="w-56 h-56 flex justify-center items-center"
          >
            {isImage ? (
              <img src={URL.createObjectURL(file.data)} alt={file.name}></img>
            ) : (
              <Image src="" width={100} height={100} alt=""></Image>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              if (index === files.length - 1) {
                setIndex(0);
              } else {
                setIndex(index + 1);
              }
            }}
          >
            <ChevronRight />
          </Button>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              uppy.removeFile(file.id);
            }}
            variant="destructive"
          >
            {" "}
            Delete This
          </Button>
          <Button> Upload All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
