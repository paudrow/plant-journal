import { router } from "../trpc";
import { authRouter } from "./auth";
import { plantRouter } from "./plant";
import { taskRecordRouter } from "./taskRecord";
import { s3Router } from "./s3";

export const appRouter = router({
  auth: authRouter,
  plants: plantRouter,
  taskRecord: taskRecordRouter,
  s3: s3Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
