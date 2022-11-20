import { z } from "zod";

export const TASK_TYPES = ["water", "fertilize", "repot"] as const
export const TaskType = z.enum(TASK_TYPES);
export type TaskType = z.infer<typeof TaskType>;
