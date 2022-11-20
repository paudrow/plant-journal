import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const plantsRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.plant.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.plant.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getIds: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input: { userId } }) => {
      const data = await ctx.prisma.plant.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      });
      return data.map((d) => d.id);
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        initialWateringFrequency: z.number(),
        lastWateredDate: z.date(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name, initialWateringFrequency, lastWateredDate } = input;
      return ctx.prisma.plant.create({
        data: {
          name,
          initialWateringFrequency,
          lastWateredDate,
          user: {
            connect: {
              id: ctx.session?.user?.id,
            },
          },
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, name } = input;
      return ctx.prisma.plant.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      await ctx.prisma.task.deleteMany({
        where: {
          plantId: id,
        },
      });
      await ctx.prisma.plant.delete({
        where: {
          id,
        },
      });
    }),
});
