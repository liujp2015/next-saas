import z from "zod";
import { protectedProcedure, router } from "../trpc-middlewares/trpc";
import { TRPCError } from "@trpc/server";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../db/db";
import { files } from "../db/schema";
import { AwsS3UploadParameters } from "@uppy/aws-s3";
import { desc, gt, sql } from "drizzle-orm";

const bucket = "test-image-1302880496";
const apiEndpoint = "https://cos.ap-chengdu.myqcloud.com";
const region = "ap-chengdu";
const COS_APP_ID = "AKID6FCvSnvpW5UjmdM0Z5g3FF1ZrukMlCQP";
const COS_APP_SECRET = "xgAXnwwsncIpHhuxpV0JOGvMdo9LQk6L";

export const fileRoutes = router({
  // 创建预签名 URL 的路由
  createPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date();
      const isoString = date.toISOString();
      const dateString = isoString.split("T")[0];

      const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
        ContentType: input.contentType,
        ContentLength: input.size,
      };

      const s3Client = new S3Client({
        endpoint: apiEndpoint,
        region: region,
        credentials: {
          accessKeyId: COS_APP_ID,
          secretAccessKey: COS_APP_SECRET,
        },
      });

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });

      return Promise.resolve({
        url,
        method: "PUT" as const,
      });
      return {
        url,
      };
    }),

  // 保存文件信息的路由
  saveFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      const url = new URL(input.path);

      const photo = await db
        .insert(files)
        .values({
          ...input,
          path: url.pathname,
          url: url.toString(),
          userId: session.user.id,
          contentType: input.type,
        })
        .returning();

      return photo[0];
    }),
  listFiles: protectedProcedure.query(async () => {
    const result = await db.query.files.findMany({
      orderBy: [desc(files.createdAt)],
    });

    return result;
  }),
  infinityQueryFiles: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.string(),
          })
          .optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const result = await db
        .select()
        .from(files)
        .limit(limit)
        .where(
          cursor
            ? sql`("files"."created_at", "files"."id") < (${new Date(
                cursor.createdAt
              ).toISOString()}, ${cursor.id})`
            : undefined
        )
        .orderBy(desc(files.createdAt));

      return {
        items: result,
        nextCursor:
          result.length > 0
            ? {
                createdAt: result[result.length - 1].createdAt!,
                id: result[result.length - 1].id,
              }
            : null,
      };
    }),
});
