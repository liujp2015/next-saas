import { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext, testRouter } from "@/utils/trpc";
import { appRouter } from "@/server/trpc-middlewares/router";
import { openRouter } from "@/server/trpc-middlewares/open-router";

const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/open",
    req: request,
    router: openRouter,
    createContext: createContext,
  });
};

export { handler as GET, handler as POST };
