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
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name } = input;
      return ctx.prisma.plant.create({
        data: {
          name,
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
    .mutation(({ ctx, input }) => {
      const { id } = input;
      return ctx.prisma.plant.delete({
        where: {
          id,
        },
      });
    }),
});
