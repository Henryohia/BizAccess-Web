const assert = require("node:assert/strict");
const { once } = require("node:events");
const Database = require("better-sqlite3");
const { after, before, test } = require("node:test");
const { createApp } = require("../dist/app.js");
const { createDatabase } = require("../dist/database.js");

let db;
let server;
let baseUrl;

before(async () => {
    db = new Database(":memory:");
    db.exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `);
    server = createApp(db).listen(0);
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    db.close();
});

test("initializes the users schema in SQLite", () => {
    const initializedDb = createDatabase(":memory:");
    try {
        const columns = initializedDb.prepare("PRAGMA table_info(users)").all();
        assert.deepEqual(columns.map((column) => column.name), ["id", "name", "email", "role"]);
    } finally {
        initializedDb.close();
    }
});

test("supports dashboard, validated CRUD, search, and user details", async () => {
    const dashboard = await fetch(baseUrl);
    assert.equal(dashboard.status, 200);
    assert.match(await dashboard.text(), /Welcome to BizAccess/);

    const invalidUser = await fetch(`${baseUrl}/users/add`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: "A", email: "not-an-email", role: "Owner" }),
        redirect: "manual"
    });
    assert.equal(invalidUser.status, 400);
    const validationPage = await invalidUser.text();
    assert.match(validationPage, /Enter a valid email address/);
    assert.match(validationPage.toLowerCase(), /select a valid role/);

    const oversizedForm = await fetch(`${baseUrl}/users/add`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            name: "x".repeat(11000),
            email: "large@example.com",
            role: "Staff"
        }),
        redirect: "manual"
    });
    assert.equal(oversizedForm.status, 413);
    assert.match((await oversizedForm.text()).toLowerCase(), /form is too large/);

    const addUser = await fetch(`${baseUrl}/users/add`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            name: "Ada Lovelace",
            email: "ada@example.com",
            role: "Manager"
        }),
        redirect: "manual"
    });
    assert.equal(addUser.status, 302);
    assert.equal(addUser.headers.get("location"), "/users?notice=added");

    const duplicateUser = await fetch(`${baseUrl}/users/add`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            name: "Ada Byron",
            email: "ADA@example.com",
            role: "Staff"
        }),
        redirect: "manual"
    });
    assert.equal(duplicateUser.status, 409);

    const search = await fetch(`${baseUrl}/users?q=ada`);
    assert.equal(search.status, 200);
    assert.match(await search.text(), /Ada Lovelace/);
    const wildcardSearch = await fetch(`${baseUrl}/users?q=%25`);
    assert.doesNotMatch(await wildcardSearch.text(), /Ada Lovelace/);

    const details = await fetch(`${baseUrl}/users/1`);
    assert.equal(details.status, 200);
    assert.match(await details.text(), /ada@example\.com/);

    const edit = await fetch(`${baseUrl}/users/1/edit`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            name: "Ada Lovelace",
            email: "ada.lovelace@example.com",
            role: "Administrator"
        }),
        redirect: "manual"
    });
    assert.equal(edit.status, 302);
    assert.equal(edit.headers.get("location"), "/users/1?notice=updated");

    const updatedDetails = await fetch(`${baseUrl}/users/1`);
    assert.match(await updatedDetails.text(), /Administrator/);

    const deleteUser = await fetch(`${baseUrl}/users/1/delete`, {
        method: "POST",
        redirect: "manual"
    });
    assert.equal(deleteUser.status, 302);
    assert.equal(deleteUser.headers.get("location"), "/users?notice=deleted");

    assert.equal((await fetch(`${baseUrl}/users/1`)).status, 404);
});
