import { z } from "zod";
import * as AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
  region: process.env.S3_UPLOAD_REGION,
});
const bucket = process.env.S3_UPLOAD_BUCKET;
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const DeleteS2FileProps = z.object({ fileUrl: z.string() })
export type DeleteS2FileProps = z.infer<typeof DeleteS2FileProps>
export async function deleteS3File({ fileUrl }: DeleteS2FileProps) {
  const key = fileUrl.split(".com/")[1];
  if (!key || !bucket) {
    return false;
  }
  const params = {
    Bucket: bucket,
    Key: key,
  };
  console.log(params);
  const { $response } = await s3.deleteObject(params).promise();
  console.log($response.error);
  return true;
}