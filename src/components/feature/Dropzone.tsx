import Uppy from "@uppy/core";
import { ReactNode, useState } from "react";

export function Dropzone({
  uppy,
  children,
}: {
  uppy: Uppy;
  children: ReactNode | ((draging: boolean) => ReactNode);
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
          uppy.addFile({
            data: file,
            name: "",
          });
        });
        setDragging(false);
      }}
    >
      {typeof children === "function" ? children(dragging) : children}
    </div>
  );
}
