import Uppy from "@uppy/core";
import { Button } from "../ui/Button";
import { useRef } from "react";
import { Plus } from "lucide-react";

export function UploadButton({ uppy }: { uppy: Uppy }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.click();
          }
        }}
      >
        <Plus />
      </Button>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach((file) => {
              uppy.addFile({
                data: file,
                name: file.name,
              });
            });
          }
          e.target.value = "";
        }}
        multiple
        className="fixed left-[-10000px]"
        ref={inputRef}
      />
    </>
  );
}
