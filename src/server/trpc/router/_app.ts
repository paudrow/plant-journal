import { router } from "../trpc";
import { authRouter } from "./auth";
import { plantsRouter } from "./plants";

export const appRouter = router({
  plants: plantsRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
