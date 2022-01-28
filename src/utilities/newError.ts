const newError = (code: number, msg: string) => {
  if (!msg.endsWith("." || "!" || "?")) {
    msg = `${msg}.`;
  }
  const error = new Error(msg);
  error.statusCode = code;
  throw error;
};

export default newError;
