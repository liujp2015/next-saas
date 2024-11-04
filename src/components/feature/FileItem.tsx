import Image from "next/image";
import { useMemo } from "react";
export function FileItem({
  url,
  name,
  isImage,
}: {
  url: string;
  name: string;
  isImage: boolean;
}) {
  return isImage ? (
    <img src={url} alt={name}></img>
  ) : (
    <Image src="" width={100} height={100} alt=""></Image>
  );
}

export function LocalFileItem({ file }: { file: File }) {
  const isImage = file.type.startsWith("image");

  const url = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file);
    }
    return "";
  }, [isImage, file]);

  return <FileItem isImage={isImage} url={url} name={file.name}></FileItem>;
}

export function RemoteFileItem({
  contentType,
  id,
  name,
}: {
  contentType: string;
  id: string;
  name: string;
}) {
  const isImage = contentType.startsWith("image");
  return (
    <FileItem isImage={isImage} url={`/image/${id}`} name={name}></FileItem>
  );
}
