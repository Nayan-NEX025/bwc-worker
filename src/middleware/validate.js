import ApiError from "../utils/error/ApiError.js";

export const validate = (schemas) => (req, res, next) => {
  try {
    const validatedData = {};

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        throw new ApiError(
          result.error.issues.map((e) => e.message).join(", "),
          400
        );
      }
      validatedData.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        throw new ApiError(
          result.error.issues.map((e) => e.message).join(", "),
          400
        );
      }
      validatedData.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        throw new ApiError(
          result.error.issues.map((e) => e.message).join(", "),
          400
        );
      }
      validatedData.params = result.data;
    }

    req.validated = validatedData;
    next();
  } catch (err) {
    next(err);
  }
};
