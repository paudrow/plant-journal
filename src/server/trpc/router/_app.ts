import { router } from "../trpc";
import { authRouter } from "./auth";
import { plantsRouter } from "./plants";
import { tasksRouter } from "./tasks";

export const appRouter = router({
  auth: authRouter,
  plants: plantsRouter,
  tasks: tasksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
