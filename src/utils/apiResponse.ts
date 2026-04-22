export const successResponse = <T>(data: T) => {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
};

export const errorResponse = (message: string, code: number) => {
  return {
    success: false,
    error: {
      message,
      code,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
};