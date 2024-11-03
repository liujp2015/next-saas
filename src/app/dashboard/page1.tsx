// import { Input } from "@/components/Input";
// import { Textarea } from "@/components/Textarea";
// import { Button } from "@/components/Button";
// import { db } from "@/server/db/db";
// import { SessionProvider, UserInfo } from "../UserInfo";
// import { getServerSession } from "@/server/auth";
// import { redirect } from "next/navigation";

// export default async function Home() {
//   // const users = await db.query.users.findMany();

//   // const session = await getServerSession();

//   // if (!session?.user) {
//   //   redirect("/api/auth/signin");
//   // }

//   return (
//     <div className="h-screen flex justify-center items-center">
//       <form className="w-full max-w-md flex flex-col gap-4">
//         <h1 className="text-center text-2xl font-bold">Create App</h1>
//         <Input name="name" placeholder="App Name" />
//         <Textarea name="description" placeholder="Description" />
//         <Button type="submit">Submit</Button>
//       </form>
//       {/* {users.map((user) => (
//         <div key={user.id}>{user.name}</div>
//       ))} */}

//       <SessionProvider>
//         <UserInfo></UserInfo>
//       </SessionProvider>
//     </div>
//   );
// }

// import { caller } from "@/utils/trpc";

// export default async function Home() {
//   const data = await caller.hello();
//   return (
//     <div className="h-screen flex justify-center items-center">
//       <div>Dashboard {data.hello}</div>
//     </div>
//   );
// }
