import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { files, users } from "./schema";

export const createUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
});

export const updateUserSchema = createUserSchema.pick({ email: true });
export const fileSchema = createSelectSchema(files);

export const filesCanOrderByColumns = fileSchema.pick({
  createdAt: true,
  deletedAt: true,
});
