import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { Good } from "../src/models/goods.js";


let insertedGood;


const firstGood = {
  name: "Pocion de Golondrina",
  description: "Pocion de Brujo",
  category: "Potion",
  material: "hiebas",
  weight: 1,
  value: 100,
  stock: 50
};


beforeEach(async () => {
  await Good.deleteMany({});
  insertedGood = await Good.create(firstGood);
});


describe("POST /goods", () => {
  test("should create a new good", async () => {
    const payload = {
      name: "Colonia de Lirio y Grosellas",
      description: "Una colonia muy especial",
      category: "ArPotionmor",
      material: "hierbas",
      weight: 2,
      value: 150,
      stock: 50
    };
    const res = await request(app)
      .post("/goods")
      .send(payload)
      .expect(201);


    expect(res.body).toMatchObject(payload);


    const found = await Good.findById(res.body._id);
    expect(found).not.toBeNull();
    expect(found.name).toBe("Colonia de Lirio y Grosellas");
  });


  test("should return 500 when missing required fields", async () => {
    // Omitimos "name"
    await request(app)
      .post("/goods")
      .send({ ...firstGood, name: undefined })
      .expect(500);
  });
});


describe("GET /goods", () => {
  test("should return all goods", async () => {
    const res = await request(app)
      .get("/goods")
      .expect(200);


    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });


  test("should return 404 when no goods", async () => {
    await Good.deleteMany({});
    await request(app)
      .get("/goods")
      .expect(404);
  });
});


describe("GET /goods/:id", () => {
  test("should return a good by id", async () => {
    const res = await request(app)
      .get(`/goods/${insertedGood._id}`)
      .expect(200);


    expect(res.body).toMatchObject(firstGood);
  });


  test("should return 404 for non-existent id", async () => {
    const id = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/goods/${id}`)
      .expect(404);
  });


  test("should return 500 for invalid id format", async () => {
    await request(app)
      .get("/goods/invalid-id")
      .expect(500);
  });
});


describe("GET /goods/name/:name", () => {
  test("should return a good by name", async () => {
    const res = await request(app)
      .get(`/goods/name/${firstGood.name}`)
      .expect(200);


    expect(res.body.name).toBe(firstGood.name);
  });


  test("should return 404 when name not found", async () => {
    await request(app)
      .get("/goods/name/NoExiste")
      .expect(404);
  });
});


describe("GET /goods/category/:category", () => {
  test("should return goods by category", async () => {
    const res = await request(app)
      .get(`/goods/category/${firstGood.category}`)
      .expect(200);


    expect(res.body[0].category).toBe(firstGood.category);
  });


  test("should return 404 when category not found", async () => {
    await request(app)
      .get("/goods/category/NonExistente")
      .expect(404);
  });
});


describe("PATCH /goods/:id", () => {
  test("should update fields of a good", async () => {
    const res = await request(app)
      .patch(`/goods/${insertedGood._id}`)
      .send({ weight: 15, stock: 180 })
      .expect(200);


    expect(res.body.weight).toBe(15);
    expect(res.body.stock).toBe(180);


    const updated = await Good.findById(insertedGood._id);
    expect(updated.weight).toBe(15);
  });


  test("should return 400 for invalid field update", async () => {
    await request(app)
      .patch(`/goods/${insertedGood._id}`)
      .send({ unknown: 123 })
      .expect(400);
  });


  test("should return 404 when id not found", async () => {
    const id = new mongoose.Types.ObjectId();
    await request(app)
      .patch(`/goods/${id}`)
      .send({ weight: 5 })
      .expect(404);
  });


  test("should return 500 for invalid id format", async () => {
    await request(app)
      .patch("/goods/invalid-id")
      .send({ weight: 5 })
      .expect(500);
  });
});


describe("DELETE /goods/:id", () => {
  test("should delete a good by id", async () => {
    const res = await request(app)
      .delete(`/goods/${insertedGood._id}`)
      .expect(200);


    expect(res.body._id).toBe(String(insertedGood._id));
    const deleted = await Good.findById(insertedGood._id);
    expect(deleted).toBeNull();
  });


  test("should return 404 for non-existent id", async () => {
    const id = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/goods/${id}`)
      .expect(404);
  });


  test("should return 500 for invalid id format", async () => {
    await request(app)
      .delete("/goods/invalid-id")
      .expect(500);
  });
});











