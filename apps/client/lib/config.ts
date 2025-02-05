const isProduction = process.env.NODE_ENV === "production";

export const HTTP_URL = isProduction
  ? "https://collabodraw.mikexdev.in"  
  : "http://localhost:4000";           

export const WS_URL = isProduction
  ? "wss://collabodraw.mikexdev.in"    
  : "ws://localhost:8080";             
