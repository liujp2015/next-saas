"use client";

import { Button } from "@/components/ui/Button";
import { trpcClientReact } from "@/utils/api";

export default function StoragePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: apikeys } = trpcClientReact.apiKeys.listApiKeys.useQuery({
    appId: Number(id),
  });
  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery();
  const utils = trpcClientReact.useUtils();

  const currentApp = apps?.filter((app) => app.id === id)[0];
  return (
    <div className="container pt-10">
      <h1 className="text-3xl mb-6">Storage</h1>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl mb-6">Storage</h1>
        <Button>Plus</Button>
      </div>

      {apikeys?.map((storage) => {
        return (
          <div
            key={storage.id}
            className="border p-4 flex justify-between items-center"
          >
            <span>{storage.name}</span>
          </div>
        );
      })}
    </div>
  );
}
