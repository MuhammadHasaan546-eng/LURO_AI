import Joi from "joi";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 1024;

export const SignInSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .max(EMAIL_MAX_LENGTH)
    .email()
    .required(),
  password: Joi.string().min(1).max(PASSWORD_MAX_LENGTH).required(),
}).options({ abortEarly: false, allowUnknown: false, stripUnknown: false });

export type SignInSchemaType = {
  email: string;
  password: string;
};
