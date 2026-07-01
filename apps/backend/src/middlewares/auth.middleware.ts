import jwt, { JwtPayload } from "jsonwebtoken";
import { GatewayRequest } from "@/types/request.types";
import { AppError } from "@/utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = async (gatewayReq: GatewayRequest) => {
  const { request, context } = gatewayReq;

  
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  
  if (!authHeader) {
    console.log("AUTH HEADER NOT FOUND");
    throw new AppError("Authorization header missing", 401);
  }

  
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    console.log("INVALID AUTH FORMAT:", authHeader);
    throw new AppError("Invalid authorization format", 401);
  }

  
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("TOKEN MISSING AFTER SPLIT");
    throw new AppError("Token missing", 401);
  }

  console.log("TOKEN RECEIVED:", token);

  try {
   
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      id: string;
      email?: string;
    };

    
    if (!decoded?.id) {
      throw new AppError("Invalid token payload", 403);
    }

    
    context.user = {
      id: decoded.id,
      email: decoded.email,
    };

    console.log("AUTH SUCCESS:", context.user);

  } catch (err) {
    console.log("JWT VERIFY FAILED:", err);
    throw new AppError("Invalid or expired token", 403);
  }
};