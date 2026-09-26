import express, { type NextFunction, type Request, type Response } from "express";
import type Database from "better-sqlite3";
import { resolve } from "node:path";
import { createDatabase } from "./database";
import { createRoutes } from "./routes";

export function createApp(db: Database.Database) {
    const app = express();
    app.disable("x-powered-by");
    app.set("view engine", "ejs");
    app.set("views", resolve(__dirname, "..", "views"));
    app.use((request, response, next) => {
        response.locals.currentPath = request.path;
        next();
    });
    app.use(express.urlencoded({ extended: false, limit: "10kb" }));
    app.use(express.static(resolve(__dirname, "..", "public")));
    app.use(createRoutes(db));

    app.use((_request, response) => {
        response.status(404).render("error", {
            title: "Page not found",
            message: "The page you requested could not be found."
        });
    });

    app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
        if (response.headersSent) {
            return next(error);
        }
        const clientStatus = typeof error === "object"
            && error !== null
            && "status" in error
            && typeof error.status === "number"
            && error.status >= 400
            && error.status < 500
            ? error.status
            : undefined;
        const status = clientStatus ?? 500;
        if (status === 500) {
            console.error("Unhandled BizAccess Web request error:", error);
        }

        return response.status(status).render("error", {
            title: status === 413 ? "Form too large" : "Something went wrong",
            message: status === 413
                ? "The submitted form is too large. Please shorten your input and try again."
                : status === 500
                    ? "The request could not be completed. Please try again."
                    : "The submitted request could not be processed."
        });
    });

    return app;
}

if (require.main === module) {
    const rawPort = process.env.PORT ?? "3000";
    const port = Number(rawPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT value: ${rawPort}`);
    }

    const app = createApp(createDatabase());
    app.listen(port, () => {
        console.log(`BizAccess Web is running at http://localhost:${port}`);
    });
}
