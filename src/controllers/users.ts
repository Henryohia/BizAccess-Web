// src/controllers/users.ts

import type Database from "better-sqlite3";
import type { RequestHandler, Response } from "express";
import {
    createUser,
    deleteUser,
    emailExists,
    getUserById,
    getUsers,
    updateUser,
    userRoles,
    type UserInput
} from "../models/users";

// Documentation for the users controller
/**
 * Creates a users controller for handling user-related requests.
 * @param db - The database instance.
 * @returns An object containing request handlers for user-related routes.
 */

const notices: Record<string, string> = {
    added: "Business user added successfully.",
    updated: "Business user updated successfully.",
    deleted: "Business user deleted successfully."
};

function bodyValue(body: unknown, key: string): string {
    if (typeof body !== "object" || body === null) {
        return "";
    }

    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value.trim() : "";
}

// Validates user input for creating or updating a user.
/**
 * Validates user input for creating or updating a user.
 * @param body - The request body.
 * @returns An object containing the validated values and any errors.
 */

function validateUserInput(body: unknown): { values: UserInput; errors: string[] } {
    const values = {
        name: bodyValue(body, "name"),
        email: bodyValue(body, "email"),
        role: bodyValue(body, "role")
    };
    const errors: string[] = [];

    if (values.name.length < 2 || values.name.length > 100) {
        errors.push("Name must be between 2 and 100 characters.");
    }
    if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.push("Enter a valid email address.");
    }
    if (!userRoles.some((role) => role === values.role)) {
        errors.push("Select a valid role.");
    }

    return { values, errors };
}

// Parses a user ID from a string or string array.
/**
 * Parses a user ID from a string or string array.
 * @param value - The value to parse.
 * @returns The parsed user ID or undefined if invalid.
 */

function parseUserId(value: string | string[] | undefined): number | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    if (!/^[1-9]\d*$/.test(value)) {
        return undefined;
    }
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : undefined;
}

// Renders the users page with the provided data.
/**
 * Renders the users page with the provided data.   
 * @param response - The Express response object.
 * @param db - The database instance.
 * @param query - The search query.
 * @param errors - An array of error messages.
 * @param formUser - The user input values for the form.
 * @param status - The HTTP status code.
 * @param notice - An optional notice message.
 * @returns The rendered users page.
 */ 

function renderUsers(
    response: Response,
    db: Database.Database,
    query = "",
    errors: string[] = [],
    formUser: UserInput = { name: "", email: "", role: "" },
    status = 200,
    notice?: string
) {
    return response.status(status).render("users", {
        title: "Business users",
        users: getUsers(db, query),
        query,
        errors,
        formUser,
        roles: userRoles,
        notice
    });
}

// Renders a 404 error page for a user not found.
/**
 * Renders a 404 error page for a user not found.
 * @param response - The Express response object.
 * @returns The rendered error page with a 404 status code.
 */

function renderNotFound(response: Response) {
    return response.status(404).render("error", {
        title: "User not found",
        message: "The business user you requested could not be found."
    });
}

// Creates a users controller for handling user-related requests.
/**
 * Creates a users controller for handling user-related requests.
 * @param db - The database instance.
 * @returns An object containing request handlers for user-related routes.
 */


export function createUsersController(db: Database.Database) {
    const list: RequestHandler = (request, response) => {
        const rawQuery = request.query.q;
        if (rawQuery !== undefined && typeof rawQuery !== "string") {
            return renderUsers(response, db, "", ["Search must be a single text value."], undefined, 400);
        }

        const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
        if (query.length > 100) {
            return renderUsers(response, db, "", ["Search must be 100 characters or fewer."], undefined, 400);
        }

        const notice = typeof request.query.notice === "string" ? notices[request.query.notice] : undefined;
        return renderUsers(response, db, query, [], undefined, 200, notice);
    };

    const add: RequestHandler = (request, response) => {
        const { values, errors } = validateUserInput(request.body);
        if (errors.length > 0) {
            return renderUsers(response, db, "", errors, values, 400);
        }
        if (emailExists(db, values.email)) {
            return renderUsers(
                response,
                db,
                "",
                ["A business user with this email address already exists."],
                values,
                409
            );
        }

        createUser(db, values);
        return response.redirect("/users?notice=added");
    };

    const details: RequestHandler = (request, response) => {
        const id = parseUserId(request.params.id);
        const user = id === undefined ? undefined : getUserById(db, id);
        if (!user) {
            return renderNotFound(response);
        }

        const notice = typeof request.query.notice === "string" ? notices[request.query.notice] : undefined;
        return response.render("user-details", {
            title: user.name,
            user,
            notice
        });
    };

    const editForm: RequestHandler = (request, response) => {
        const id = parseUserId(request.params.id);
        const user = id === undefined ? undefined : getUserById(db, id);
        if (!user) {
            return renderNotFound(response);
        }

        return response.render("user-edit", {
            title: "Edit business user",
            user,
            roles: userRoles,
            errors: []
        });
    };

    const update: RequestHandler = (request, response) => {
        const id = parseUserId(request.params.id);
        const currentUser = id === undefined ? undefined : getUserById(db, id);
        if (id === undefined || !currentUser) {
            return renderNotFound(response);
        }

        const { values, errors } = validateUserInput(request.body);
        if (errors.length > 0) {
            return response.status(400).render("user-edit", {
                title: "Edit business user",
                user: { ...values, id },
                roles: userRoles,
                errors
            });
        }
        if (emailExists(db, values.email, id)) {
            return response.status(409).render("user-edit", {
                title: "Edit business user",
                user: { ...values, id },
                roles: userRoles,
                errors: ["A business user with this email address already exists."]
            });
        }

        updateUser(db, id, values);
        return response.redirect(`/users/${id}?notice=updated`);
    };

    const remove: RequestHandler = (request, response) => {
        const id = parseUserId(request.params.id);
        if (id === undefined || !getUserById(db, id)) {
            return renderNotFound(response);
        }

        deleteUser(db, id);
        return response.redirect("/users?notice=deleted");
    };

    return { list, add, details, editForm, update, remove };
}
