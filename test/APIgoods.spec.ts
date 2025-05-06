/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Good } from "../src/models/goods.js";
import mongoose from "mongoose";


// Variable para almacenar un ID de bien para pruebas\ nlet goodTestId;


// Antes de todas las pruebas, nos aseguramos de estar conectados a la base de datos de prueba
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST ||
        "mongodb://localhost:27017/posada-lobo-blanco-test"
    );
  } else {
    const dbName = mongoose.connection.db?.databaseName;
    if (dbName !== "posada-lobo-blanco-test") {
      console.warn(
        `⚠️ Advertencia: Tests ejecutándose en la base de datos "${dbName}" en lugar de "posada-lobo-blanco-test"`
      );
    }
  }
});


// Después de cada prueba, limpiamos la colección de bienes
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Good.deleteMany({});
  }
});


// Después de todas las pruebas, mantenemos la conexión abierta
afterAll(async () => {
  // No cerramos la conexión para evitar problemas con otras pruebas
  // await mongoose.connection.close();
});


describe("Good API Tests", () => {
  // TEST: Creación de un bien
  describe("POST /goods", () => {
    test("should create a new good", async () => {
      const response = await request(app)
        .post("/goods")
        .send({
          name: "Pocion de Golondrina",
          description: "Pocion de Brujo",
          category: "Potion",
          material: "Hierbas",
          weight: 1,
          value: 100,
          stock: 50,
        })
        .expect(201);


      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Pocion de Golondrina");
      expect(response.body.description).toBe("Pocion de Brujo");
      expect(response.body.category).toBe("Potion");


      goodTestId = response.body._id;
    });


    test("should handle validation errors", async () => {
      const response = await request(app)
        .post("/goods")
        .send({
          // Falta el nombre
          description: "Una colonia muy especial",
          category: "Potion",
          material: "Hierbas",
          weight: 2,
          value: 150,
          stock: 50,
        })
        .expect(500);


      expect(response.body).toHaveProperty("errors");
    });
  });


  // TEST: Obtener todos los bienes
  describe("GET /goods", () => {
    test("should return empty array with 404 when no goods exist", async () => {
      await request(app).get("/goods").expect(404);
    });


    test("should return all goods", async () => {
      await Good.create([
        { name: "Espada", description: "Espada de acero", category: "Weapon", material: "Acero", weight: 10, value: 80, stock: 200 },
        { name: "Escudo", description: "Escudo reforzado", category: "Armor", material: "Hierro", weight: 15, value: 70, stock: 150 },
      ]);


      const response = await request(app).get("/goods").expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });


  // TEST: Obtener un bien por ID
  describe("GET /goods/:id", () => {
    test("should return a good by ID", async () => {
      const goodData = await Good.create({
        name: "Armadura",
        description: "Armadura de hierro",
        category: "Armor",
        material: "Hierro",
        weight: 20,
        value: 120,
        stock: 100,
      });


      const response = await request(app)
        .get(`/goods/${goodData._id}`)
        .expect(200);


      expect(response.body.name).toBe("Armadura");
      expect(response.body.category).toBe("Armor");
    });


    test("should return 404 if good not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app).get(`/goods/${nonExistentId}`).expect(404);
    });
  });


  // TEST: Obtener un bien por nombre
  describe("GET /goods/name/:name", () => {
    test("should return a good by name", async () => {
      await Good.create({
        name: "Pocion",
        description: "Tónico",
        category: "Potion",
        material: "Herbs",
        weight: 1,
        value: 50,
        stock: 30,
      });


      const response = await request(app).get("/goods/name/Pocion").expect(200);
      expect(response.body.name).toBe("Pocion");
    });


    test("should return 404 if good name not found", async () => {
      await request(app).get("/goods/name/NoExiste").expect(404);
    });
  });


  // TEST: PATCH /goods?id=
  describe("PATCH /goods?id=", () => {
    test("should return 400 if id not provided", async () => {
      await request(app).patch("/goods").send({ stock: 90 }).expect(400);
    });


    test("should update a good by id via query", async () => {
      const goodData = await Good.create({
        name: "Yelmo",
        description: "Yelmo de plata",
        category: "Armor",
        material: "Plata",
        weight: 5,
        value: 60,
        stock: 40,
      });


      const response = await request(app)
        .patch(`/goods?id=${goodData.id}`)
        .send({ stock: 35 })
        .expect(200);


      expect(response.body.stock).toBe(35);
    });
  });


  // TEST: DELETE /goods?id=
  describe("DELETE /goods?id=", () => {
    test("should return 400 if id not provided", async () => {
      await request(app).delete("/goods").expect(400);
    });


    test("should delete a good by id via query", async () => {
      const goodData = await Good.create({
        name: "Botas",
        description: "Botas ligeras",
        category: "Tool",
        material: "Cuero",
        weight: 3,
        value: 40,
        stock: 60,
      });


      const response = await request(app)
        .delete(`/goods?id=${goodData.id}`)
        .expect(200);


      expect(response.body.name).toBe("Botas");
      const deleted = await Good.findById(response.body._id);
      expect(deleted).toBeNull();
    });
  });
});



