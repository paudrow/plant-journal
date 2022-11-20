import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { TaskType } from "../../../types/TaskType";

export const tasksRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.task.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.task.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getIds: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input: { userId } }) => {
      const data = await ctx.prisma.task.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      });
      return data.map((d) => d.id);
    }),
  getForPlant: publicProcedure
    .input(z.object({ plantId: z.string() }))
    .query(async ({ ctx, input: { plantId } }) => {
      return await ctx.prisma.task.findMany({
        where: {
          plantId: plantId,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        type: TaskType,
        plantId: z.string(),
        dueDate: z.date(),
        status: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { type, dueDate, status } = input;
      return ctx.prisma.task.create({
        data: {
          type,
          dueDate,
          status,
          plant: {
            connect: {
              id: input.plantId,
            },
          },
          user: {
            connect: {
              id: ctx.session?.user?.id,
            },
          },
        },
      });
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id } = input;
      return ctx.prisma.task.delete({
        where: {
          id,
        },
      });
    }),
});
