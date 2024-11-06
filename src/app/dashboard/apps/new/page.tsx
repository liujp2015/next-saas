import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getServerSession } from "@/server/auth";
import { serverCaller } from "@/utils/trpc";
import { redirect } from "next/navigation";
import { createAppSchema } from "@/server/db/validate-schema";
import { SubmitButton } from "./SubmitButton";

export default function createApp() {
  async function createApp(formData: FormData) {
    "use server";
    const name = formData.get("name");
    const description = formData.get("description");

    const input = createAppSchema
      .pick({ name: true, description: true })
      .safeParse({
        name,
        description,
      });

    if (input.success) {
      const session = await getServerSession();
      const newApp = await serverCaller({ session }).apps.createApp(input.data);
      console.log(newApp);
      redirect(`/dashboard/apps/${newApp.id}`);
    } else {
      throw Error(input.error);
    }
  }

  return (
    <div className="h-full flex justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4" action={createApp}>
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input
          name="name"
          placeholder="App Name"
          minLength={3}
          required
        ></Input>
        <Textarea name="description" placeholder="Description"></Textarea>
        <SubmitButton></SubmitButton>
      </form>
    </div>
  );
}
