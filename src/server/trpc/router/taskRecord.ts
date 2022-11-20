import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { TaskType } from "../../../types/TaskType";

export const taskRecordsRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.taskRecord.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.taskRecord.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getIds: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input: { userId } }) => {
      const data = await ctx.prisma.taskRecord.findMany({
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
      return await ctx.prisma.taskRecord.findMany({
        where: {
          plantId: plantId,
        },
        orderBy: {
          doneDate: "desc",
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        type: TaskType,
        plantId: z.string(),
        doneDate: z.date(),
        status: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { type, doneDate: doneDate, status } = input;
      return ctx.prisma.taskRecord.create({
        data: {
          type,
          doneDate,
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
      return ctx.prisma.taskRecord.delete({
        where: {
          id,
        },
      });
    }),
});
