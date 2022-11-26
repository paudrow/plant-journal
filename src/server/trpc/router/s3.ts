import { router, protectedProcedure } from "../trpc";
import { DeleteS2FileProps, deleteS3File } from "./common";

export const s3Router = router({
  deleteFile: protectedProcedure
    .input(DeleteS2FileProps)
    .mutation(
      async ({ input: { fileUrl } }) => await deleteS3File({ fileUrl })
    ),
});
