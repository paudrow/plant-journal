import { z } from "zod";
import dayjs from "dayjs";

import { router, publicProcedure, protectedProcedure } from "../trpc";
import { deleteS3File } from "./common";

export const plantRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.plant.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.plant.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getIds: protectedProcedure
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
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name, imageUrl } = input;
      return ctx.prisma.plant.create({
        data: {
          name,
          imageUrl,
          user: {
            connect: {
              id: ctx.session?.user?.id,
            },
          },
        },
      });
    }),
  getNextTask: protectedProcedure
    .input(z.object({ plantId: z.string() }))
    .query(async ({ ctx, input: { plantId } }) => {
      const plant = await ctx.prisma.plant.findUnique({
        where: {
          id: plantId,
        },
      });
      if (!plant) {
        return null;
      }
      const taskRecords = await ctx.prisma.taskRecord.findMany({
        where: {
          plantId: plantId,
          type: "water",
        },
        orderBy: {
          doneDate: "desc",
        },
        take: 3,
      });
      if (taskRecords.length !== 3) {
        return null;
      }
      const [w1, w2, w3] = taskRecords;
      const w1ToW2 = dayjs(w1?.doneDate).diff(dayjs(w2?.doneDate), "day");
      const w2ToW3 = dayjs(w2?.doneDate).diff(dayjs(w3?.doneDate), "day");
      const averageNumberOfDays = (w1ToW2 + w2ToW3) / 2;
      const nextWaterDate = dayjs(w1?.doneDate)
        .add(averageNumberOfDays, "day")
        .toDate();
      return {
        nextWaterDate,
      };
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        imageUrl: z.string()
      }).partial()
    )
    .mutation(({ ctx, input }) => {
      const { id, name, imageUrl } = input;
      return ctx.prisma.plant.update({
        where: {
          id,
        },
        data: {
          ...(name && { name }),
          ...(imageUrl && { imageUrl }),
        },
      });
    }),
  removeImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const plant = await ctx.prisma.plant.findUnique({
        where: {
          id,
        },
      });
      if (!plant) {
        return null;
      }
      if (plant.imageUrl) {
        await deleteS3File({ fileUrl: plant.imageUrl });
      }
      await ctx.prisma.plant.update({
        where: {
          id,
        },
        data: {
          imageUrl: null,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input: {id} }) => {
      const plant = await ctx.prisma.plant.findUnique({
        where: {
          id,
        },
      })
      if(!plant) {
        return
      }
      if (plant.imageUrl) {
        await deleteS3File({ fileUrl: plant.imageUrl });
      }
      await ctx.prisma.taskRecord.deleteMany({
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
