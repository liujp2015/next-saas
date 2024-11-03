"use client";

import {
  useSession,
  SessionProvider as NextAuthProvider,
} from "next-auth/react";

export function UserInfo() {
  const session = useSession();

  console.log(session);

  return <div>{session.data?.user?.name}</div>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SessionProvider(props: any) {
  return <NextAuthProvider {...props} />;
}
