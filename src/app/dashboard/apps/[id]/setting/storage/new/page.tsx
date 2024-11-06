"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { type S3StorageConfiguration } from "@/server/db/schema";
import { trpcClientReact } from "@/utils/api";
import { redirect, useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

export default function StoragePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<S3StorageConfiguration & { name: string }>();
  const { mutate } = trpcClientReact.storages.createStorage.useMutation();

  const onSubmit: SubmitHandler<S3StorageConfiguration & { name: string }> = (
    data
  ) => {
    console.log("submit");
    mutate(data);
    router.push(`/dashboard/apps/${id}/storage`);
  };

  return (
    <div className="container pt-10">
      <h1 className="text-3xl mb-6 max-w-md mx-auto">Create Storage</h1>
      <form
        className="flex flex-col gap-4 max-w-md mx-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label>name</Label>
          <Input
            {...register("name", {
              required: "Name is required",
            })}
          />
          <span className="text-red-500">{errors.name?.message}</span>
        </div>
        <div>
          <Label>bucket</Label>
          <Input
            {...register("bucket", {
              required: "Bucket is required",
            })}
          />
        </div>
        <div>
          <Label>accessKeyId</Label>
          <Input
            {...register("accessKeyId", {
              required: "accessKeyId is required",
            })}
          />
        </div>
        <div>
          <Label>region</Label>
          <Input
            {...register("region", {
              required: "region is required",
            })}
          />
        </div>
        <div>
          <Label>password</Label>
          <Input
            type="password"
            {...register("secretAccessKey", {
              required: "secretAccessKey is required",
            })}
          />
        </div>
        <div>
          <Label>apiEndpoint</Label>
          <Input {...register("apiEndpoint")} />
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
