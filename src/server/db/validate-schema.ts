import { createInsertSchema } from "drizzle-zod";
import { users } from "./schema";

export const createUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
});

export const updateUserSchema = createUserSchema.pick({ email: true });
