"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { trpcClientReact } from "@/utils/api";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ApiKeysPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: apikeys } = trpcClientReact.apiKeys.listApiKeys.useQuery({
    appId: id,
  });
  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery();
  const { mutate } = trpcClientReact.apiKeys.createApikey.useMutation();

  const utils = trpcClientReact.useUtils();

  const currentApp = apps?.filter((app) => app.id === id)[0];

  const [newApiKeyName, setNewApiKeyName] = useState("");

  return (
    <div className=" pt-10">
      <h1 className="text-3xl mb-6">Storage</h1>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl mb-6">Storage</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <Plus />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Name"
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />

              <Button
                type="submit"
                onClick={() => {
                  mutate({
                    appId: id,
                    name: newApiKeyName,
                  });
                }}
              >
                Submit
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {apikeys?.map((apikey) => {
        return (
          <div
            key={apikey.id}
            className="border p-4 flex justify-between items-center"
          >
            <span>{apikey.name}</span>
            <span>{apikey.key}</span>
          </div>
        );
      })}
    </div>
  );
}
