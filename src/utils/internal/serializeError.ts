/**
 * @internal
 */
export const serializeError = (error: any) => {
  if (
    typeof error === "object" &&
    error !== null &&
    typeof error.toJSON === "function"
  )
    return error.toJSON();
  else if (error instanceof Error)
    return {
      ...error,
      name: error.name,
      stack: error.stack,
      message: error.message,
    };
  return error;
};
