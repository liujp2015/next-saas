import { trpcClientReact } from "@/utils/api";
import { Button } from "../ui/Button";
import { Trash2, Copy } from "lucide-react";
import copy from "copy-to-clipboard";
import { toast } from "sonner";

export function DeleteFile({
  fileId,
  onDeleteSuccess,
}: {
  fileId: string;
  onDeleteSuccess: (fileId: string) => void;
}) {
  // function implementation goes here
  const { mutate: deleteFile, isPending } =
    trpcClientReact.file.deleteFile.useMutation({
      onSuccess() {
        onDeleteSuccess(fileId);
      },
    });

  const handleRemoveFile = () => {
    deleteFile(fileId);
    toast("delete success");
  };

  return (
    <Button variant="ghost" onClick={handleRemoveFile} disabled={isPending}>
      <Trash2 />
    </Button>
  );
}

export function CopyUrl({ url }: { url: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => {
        copy(url);
        toast("success");
      }}
    >
      <Copy />
    </Button>
  );
}
