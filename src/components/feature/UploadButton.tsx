import Uppy from "@uppy/core";

export function UploadButton({ uppy }: { uppy: Uppy }) {
  return (
    <input
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
  );
}