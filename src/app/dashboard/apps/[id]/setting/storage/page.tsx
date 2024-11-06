"use client";

import { Button } from "@/components/ui/Button";
import { trpcClientReact } from "@/utils/api";
import { Plus } from "lucide-react";

export default function StoragePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: storages } = trpcClientReact.storages.listStorages.useQuery();
  debugger;
  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery();
  const utils = trpcClientReact.useUtils();

  const { mutate } = trpcClientReact.apps.changeStorage.useMutation({
    onSuccess: (data, { appId, storageId }) => {
      utils.apps.listApps.setData(void 0, (prev) => {
        if (!prev) {
          return prev;
        }
        return prev.map((p) =>
          p.id === appId ? { ...p, storageId: storageId } : p
        );
      });
    },
  });

  const currentApp = apps?.filter((app) => app.id === id)[0];
  return (
    <div className=" pt-10">
      <h1 className="text-3xl mb-6">Storage</h1>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl mb-6">Storage</h1>
        <Button>
          <Plus></Plus>
        </Button>
      </div>

      {storages?.map((storage) => {
        return (
          <div
            key={storage.id}
            className="border p-4 flex justify-between items-center"
          >
            <span>{storage.name}</span>
            <Button
              disabled={storage.id === currentApp?.storageId}
              onClick={() => mutate({ appId: id, storageId: storage.id })}
            >
              Use
            </Button>
          </div>
        );
      })}
    </div>
  );
}
