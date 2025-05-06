import { describe, test } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("POST /users", () => {
  test("Should successfully create a new user", async () => {
    await request(app)
      .post("/users")
      .send({
        name: "Eduardo Segredo",
        username: "esegredo",
        email: "esegredo@example.com",
      })
      .expect(201);
  });
});