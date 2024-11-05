import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { trpcClientReact } from "@/utils/api";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export default function AppDashboardNav({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery();

  const currentApp = apps?.filter((app) => app.id === id)[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {isPending
          ? "Loading..."
          : currentApp
          ? currentApp.name
          : "No App Selected"}
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
