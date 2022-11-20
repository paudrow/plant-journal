import { router } from "../trpc";
import { authRouter } from "./auth";
import { plantsRouter as plantRouter } from "./plant";
import { taskRecordsRouter as taskRecordRouter } from "./taskRecord";

export const appRouter = router({
  auth: authRouter,
  plants: plantRouter,
  taskRecord: taskRecordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
