import { z } from "zod";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 1024;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const SignInSchema = z.object({
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LENGTH, "Email address is too long")
    .email("Invalid email address")
    .transform(normalizeEmail),
  password: z
    .string()
    .min(1, "Password is required")
    .max(PASSWORD_MAX_LENGTH, "Password is too long"),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
