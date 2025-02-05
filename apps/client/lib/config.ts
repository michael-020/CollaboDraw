const isProduction = process.env.NODE_ENV === "production";

export const HTTP_URL = isProduction
  ? "http://collabodraw-http.mikexdev.in"  
  : "http://localhost:4000";           

export const WS_URL = isProduction
  ? "ws://collabodraw-ws.mikexdev.in"    
  : "ws://localhost:8080";             
