import { AppError } from "@/utils/AppError";
import { errorResponse } from "@/utils/apiResponse";

export const errorMiddleware = (error: unknown): Response => {
  console.error("Error:", error);

  
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify(errorResponse(error.message, error.statusCode)),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  
  return new Response(
    JSON.stringify(errorResponse("Internal Server Error", 500)),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
};