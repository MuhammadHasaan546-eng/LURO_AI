import Joi from "joi";

export const validateRequestBody = async <T>(
  request: Request,
  schema: Joi.Schema,
): Promise<{ value?: T; error?: Joi.ValidationError }> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: new Joi.ValidationError("Malformed JSON", [], null) };
  }
  const { value, error } = schema.validate(body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });
  return error ? { error } : { value: value as T };
};

export const validationResponse = (error: Joi.ValidationError) => {
  const fieldErrors: Record<string, string[]> = {};
  for (const detail of error.details) {
    const field = detail.path.join(".");
    if (field) (fieldErrors[field] ??= []).push(detail.message);
  }
  return {
    message: "Please correct the highlighted fields.",
    fieldErrors,
    formErrors: error.details
      .filter((detail) => detail.path.length === 0)
      .map((detail) => detail.message),
  };
};

export const objectIdSchema = Joi.string().hex().length(24).required();
export const providerParamSchema = Joi.string()
  .valid("google", "apple")
  .required();
export const accountNameSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
}).options({ allowUnknown: false, abortEarly: false });
export const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(1024).required(),
  newPassword: Joi.string().min(12).max(1024).required(),
}).options({ allowUnknown: false, abortEarly: false });
export const emailSchema = Joi.object({
  email: Joi.string().trim().lowercase().max(254).email().required(),
}).options({ allowUnknown: false, abortEarly: false });
export const tokenSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
}).options({ allowUnknown: false, abortEarly: false });
