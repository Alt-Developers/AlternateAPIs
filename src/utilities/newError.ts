const newError = (
  code: number,
  msg: string,
  type?: string,
  validationLocation?: string
) => {
  if (!msg.endsWith("." || "!" || "?")) {
    msg = `${msg}.`;
  }
  const error = new Error(msg);
  error.statusCode = code;
  error.type = type;
  error.location = validationLocation;
  throw error;
};

export default newError;
