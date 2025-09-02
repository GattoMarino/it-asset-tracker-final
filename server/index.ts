import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes.js";
import { log } from "./utils.js";
import { pool } from "./db.js"; // Importa il pool del database

if (!process.env.SESSION_SECRET) {
  throw new Error("La variabile d'ambiente SESSION_SECRET deve essere impostata.");
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- NUOVO: Configurazione di express-session ---
const PgStore = connectPgSimple(session);
app.use(
  session({
    store: new PgStore({
      pool: pool, // Usa il pool di connessione esistente
      tableName: "user_sessions", // Nome della tabella per le sessioni
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in produzione (HTTPS)
      maxAge: 30 * 24 * 60 * 60 * 1000, // Scadenza: 30 giorni
    },
  }),
);
// --- FINE BLOCCO NUOVO ---


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Non rilanciare l'errore per evitare crash, specialmente in un ambiente serverless
    // throw err;
  });

  if (process.env.NODE_ENV === "development") {
    // Use dynamic import for development-only dependencies
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  
  // In un ambiente serverless, non c'è bisogno di specificare 'localhost'
  // Vercel gestirà il binding all'host corretto.
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();