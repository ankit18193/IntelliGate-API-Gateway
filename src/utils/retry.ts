type RetryableError = {
  status?: number;
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (error: unknown) {
    
    let status = 500;

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error
    ) {
      const err = error as RetryableError;
      status = err.status ?? 500;
    }

    
    if (retries <= 0 || status < 500) {
      throw error;
    }

    console.warn(
      `Retrying... attempts left: ${retries}, delay: ${delay}ms`
    );

    await new Promise((res) => setTimeout(res, delay));

    return retry(fn, retries - 1, delay * 2);
  }
};