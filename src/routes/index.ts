import express from "express";
import type Database from "better-sqlite3";
import { createDashboardController } from "../controllers/dashboard";
import { createRolesController } from "../controllers/roles";
import { createUsersRouter } from "./users";

export function createRoutes(db: Database.Database) {
    const router = express.Router();

    router.get("/", createDashboardController(db));
    router.get("/roles", createRolesController(db));
    router.use("/users", createUsersRouter(db));

    return router;
}
