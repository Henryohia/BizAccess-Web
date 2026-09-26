import express from "express";
import type Database from "better-sqlite3";
import { createUsersController } from "../controllers/users";

export function createUsersRouter(db: Database.Database) {
    const router = express.Router();
    const users = createUsersController(db);

    router.get("/", users.list);
    router.post("/add", users.add);
    router.get("/:id/edit", users.editForm);
    router.post("/:id/edit", users.update);
    router.post("/:id/delete", users.remove);
    router.get("/:id", users.details);

    return router;
}
