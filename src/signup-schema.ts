import { z } from "zod";

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 1024;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const SignUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(NAME_MAX_LENGTH, "First name is too long"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(NAME_MAX_LENGTH, "Last name is too long"),
    email: z
      .string()
      .trim()
      .max(EMAIL_MAX_LENGTH, "Email address is too long")
      .email("Invalid email address")
      .transform(normalizeEmail),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .max(PASSWORD_MAX_LENGTH, "Password is too long")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/\d/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
