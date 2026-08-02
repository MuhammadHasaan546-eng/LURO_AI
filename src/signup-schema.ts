import Joi from "joi";

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 1024;

const email = Joi.string().trim().lowercase().max(EMAIL_MAX_LENGTH).email();
const password = Joi.string()
  .min(12)
  .max(PASSWORD_MAX_LENGTH)
  .pattern(/[a-z]/)
  .pattern(/[A-Z]/)
  .pattern(/\d/)
  .pattern(/[^A-Za-z0-9]/);

export const SignUpSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(NAME_MAX_LENGTH).required(),
  lastName: Joi.string().trim().min(1).max(NAME_MAX_LENGTH).required(),
  email: email.required(),
  password: password.required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
}).options({ abortEarly: false, allowUnknown: false, stripUnknown: false });

export type SignUpSchemaType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
