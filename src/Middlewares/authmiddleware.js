import "dotenv/config";
import jwt from "jsonwebtoken";

export const authenticateMiddle = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    return res.status(401).json({ message: "Invalid JWT Token" });
  } else {
    jwt.verify(jwtToken, process.env.JWT_SECRET, async (error, payload) => {
      if (error) {
        return res.status(401).json({ message: "Invalid JWT Token" });
      } else {
        req.userId = payload.id;
        next();
      }
    });
  }
};
