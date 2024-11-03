import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useState } from "react";
import { useUppyState } from "@/app/dashboard/useUppyState";
import Uppy from "@uppy/core";

export function UploadPreview({ uppy }: { uppy: Uppy }) {
  const open = useUppyState(uppy, (s) => Object.keys(s.files).length > 0);

  return (
    <Dialog open={open}>
      <DialogContent>Text</DialogContent>
    </Dialog>
  );
}
