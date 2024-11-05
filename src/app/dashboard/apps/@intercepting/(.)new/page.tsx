import { DialogContent, DialogTitle } from "@/components/ui/Dialog";
import CreateApp from "../../new/page";
import BackableDialog from "./BackableDialog";

export default function InterceptingCreateApp() {
  return (
    <BackableDialog>
      <DialogContent>
        <DialogTitle>Create App</DialogTitle> {/* 添加标题 */}
        <CreateApp></CreateApp>
      </DialogContent>
    </BackableDialog>
  );
}
