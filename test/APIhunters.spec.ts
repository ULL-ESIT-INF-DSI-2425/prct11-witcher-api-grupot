import { describe, test, expect, beforeAll, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Hunter } from "../src/models/hunters.js";
import mongoose from "mongoose";

// Antes de todas las pruebas, nos aseguramos de estar conectados a la base de datos de prueba
beforeAll(async () => {
  // Comprobamos si ya hay una conexión activa
  if (mongoose.connection.readyState === 0) { // 0 = desconectado
    // Conectar solo si no hay conexiones activas
    await mongoose.connect(process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/posada-lobo-blanco-test");
  } else {
    // Si ya hay una conexión, verificamos que sea a la base de datos de prueba
    const dbName = mongoose.connection.db?.databaseName;
    if (dbName !== 'posada-lobo-blanco-test') {
      console.warn(`⚠️ Advertencia: Tests ejecutándose en la base de datos "${dbName}" en lugar de "posada-lobo-blanco-test"`);
    }
  }
});

// Después de cada prueba, limpiamos la colección de hunters
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Hunter.deleteMany({});
  }
});

// // Después de todas las pruebas, mantenemos la conexión abierta
// // para evitar conflictos con otras pruebas o con el servidor
// afterAll(async () => {
//   // No cerramos la conexión para evitar problemas con otras pruebas
//   // Si realmente necesitas cerrarla, asegúrate de que no haya otras pruebas ejecutándose
//   // await mongoose.connection.close();
// });

describe("Hunters API Tests", () => {
  // TEST: Creación de un cazador
  describe("POST /hunters", () => {
    test("should create a new hunter", async () => {
      const response = await request(app)
        .post("/hunters")
        .send({
          name: "Geralt",
          race: "Human",
          location: "Astera"
        })
        .expect(201);

      // Verificamos que el cazador se creó correctamente
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Geralt");
      expect(response.body.race).toBe("Human");
      expect(response.body.location).toBe("Astera");
    });

    test("should handle validation errors", async () => {
      // Ejemplo de prueba de validación - ajusta según tus requisitos de validación
      const response = await request(app)
        .post("/hunters")
        .send({
          // Falta el nombre, que probablemente sea requerido
          race: "Human",
          location: "Astera"
        })
        .expect(500); // Suponiendo que el modelo devuelve un error 500 en validación

      expect(response.body).toHaveProperty("errors");
    });
  });

  // TEST: Obtener todos los cazadores
  describe("GET /hunters", () => {
    test("should return empty array with 404 when no hunters exist", async () => {
      await request(app)
        .get("/hunters")
        .expect(404);
    });

    test("should return all hunters", async () => {
      // Creamos algunos cazadores de prueba
      await Hunter.create([
        { name: "Geralt", race: "Human", location: "Astera" },
        { name: "Ciri", race: "Human", location: "Cintra" }
      ]);

      const response = await request(app)
        .get("/hunters")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  // TEST: Obtener un cazador por ID
  describe("GET /hunters/:id", () => {
    test("should return a hunter by ID", async () => {
      // Crear un cazador para obtener su ID
      const hunterData = await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .get(`/hunters/${hunterData._id}`)
        .expect(200);

      expect(response.body.name).toBe("Geralt");
      expect(response.body.race).toBe("Human");
      expect(response.body.location).toBe("Astera");
    });

    test("should return 404 if hunter not found", async () => {
      // Usando un ID de MongoDB válido pero que no existe
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/hunters/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe("No se encontró el cazador");
    });
  });

  // TEST: Obtener un cazador por nombre
  describe("GET /hunters/name/:name", () => {
    test("should return a hunter by name", async () => {
      // Crear un cazador para la prueba
      await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .get("/hunters/name/Geralt")
        .expect(200);

      expect(response.body.name).toBe("Geralt");
      expect(response.body.race).toBe("Human");
      expect(response.body.location).toBe("Astera");
    });

    test("should return 404 if hunter name not found", async () => {
      const response = await request(app)
        .get("/hunters/name/NonExistentHunter")
        .expect(404);

      expect(response.body.error).toBe("No se encontró el cazador");
    });
  });

  // TEST: Obtener cazadores por localización
  describe("GET /hunters/location/:location", () => {
    test("should return hunters by location", async () => {
      // Crear cazadores para la prueba
      await Hunter.create([
        { name: "Geralt", race: "Human", location: "Astera" },
        { name: "Ciri", race: "Human", location: "Astera" },
        { name: "Yennefer", race: "Human", location: "Kaer Morhen" }
      ]);

      const response = await request(app)
        .get("/hunters/location/Astera")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].location).toBe("Astera");
      expect(response.body[1].location).toBe("Astera");
    });

    test("should return 404 if no hunters found in location", async () => {
      const response = await request(app)
        .get("/hunters/location/NonExistentLocation")
        .expect(404);

      expect(response.body.error).toBe("No se encontraron cazadores en esa localización");
    });
  });

  // TEST: Obtener cazadores por raza
  describe("GET /hunters/race/:race", () => {
    test("should return hunters by race", async () => {
      // Crear cazadores para la prueba
      await Hunter.create([
        { name: "Geralt", race: "Human", location: "Astera" },
        { name: "Regis", race: "Vampire", location: "Toussaint" },
        { name: "Zoltan", race: "Dwarf", location: "Novigrad" }
      ]);

      const response = await request(app)
        .get("/hunters/race/Human")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].race).toBe("Human");
    });

    test("should return 404 if no hunters found of that race", async () => {
      const response = await request(app)
        .get("/hunters/race/Elf")
        .expect(404);

      expect(response.body.error).toBe("No se encontraron cazadores de esa raza");
    });
  });

  // TEST: Actualizar un cazador por ID
  describe("PATCH /hunters/:id", () => {
    test("should update a hunter by ID", async () => {
      // Crear un cazador para la prueba
      const hunterData = await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .patch(`/hunters/${hunterData._id}`)
        .send({
          name: "Geralt de Rivia",
          location: "Kaer Morhen"
        })
        .expect(200);

      expect(response.body.name).toBe("Geralt de Rivia");
      expect(response.body.race).toBe("Human"); // No debería cambiar
      expect(response.body.location).toBe("Kaer Morhen");
    });

    test("should return 400 for invalid updates", async () => {
      // Crear un cazador para la prueba
      const hunterData = await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .patch(`/hunters/${hunterData._id}`)
        .send({
          invalidField: "Invalid Value"
        })
        .expect(400);

      expect(response.body.error).toBe("La actualización no está permitida");
    });

    test("should return 404 if hunter ID not found", async () => {
      // Usando un ID de MongoDB válido pero que no existe
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .patch(`/hunters/${nonExistentId}`)
        .send({
          name: "Updated Name"
        })
        .expect(404);

      expect(response.body.error).toBe("No se encontró el cazador");
    });
  });

  // TEST: Actualizar un cazador por nombre
  describe("PATCH /hunters/name/:name", () => {
    test("should update a hunter by name", async () => {
      // Crear un cazador para la prueba
      await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .patch("/hunters/name/Geralt")
        .send({
          race: "Werewolf",
          location: "Kaer Morhen"
        })
        .expect(200);

      expect(response.body.name).toBe("Geralt"); // No debería cambiar a menos que lo actualicemos
      expect(response.body.race).toBe("Werewolf");
      expect(response.body.location).toBe("Kaer Morhen");
    });

    test("should return 400 for invalid updates", async () => {
      // Crear un cazador para la prueba
      await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .patch("/hunters/name/Geralt")
        .send({
          invalidField: "Invalid Value"
        })
        .expect(400);

      expect(response.body.error).toBe("La actualización no está permitida");
    });

    test("should return 404 if hunter name not found", async () => {
      const response = await request(app)
        .patch("/hunters/name/NonExistentHunter")
        .send({
          location: "New Location"
        })
        .expect(404);

      expect(response.body.error).toBe("No se encontró el cazador");
    });
  });

  // TEST: Eliminar un cazador por ID
  describe("DELETE /hunters/:id", () => {
    test("should delete a hunter by ID", async () => {
      // Crear un cazador para la prueba
      const hunterData = await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .delete(`/hunters/${hunterData._id}`)
        .expect(200);

      expect(response.body.name).toBe("Geralt");

      // Verificar que el cazador fue eliminado
      const deletedHunter = await Hunter.findById(hunterData._id);
      expect(deletedHunter).toBeNull();
    });

    test("should return 404 if hunter ID not found", async () => {
      // Usando un ID de MongoDB válido pero que no existe
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/hunters/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe("No se encontró el cazador");
    });
  });

  // TEST: Eliminar un cazador por nombre
  describe("DELETE /hunters/name/:name", () => {
    test("should delete a hunter by name", async () => {
      // Crear un cazador para la prueba
      await Hunter.create({
        name: "Geralt",
        race: "Human",
        location: "Astera"
      });

      const response = await request(app)
        .delete("/hunters/name/Geralt")
        .expect(200);

      expect(response.body.name).toBe("Geralt");

      // Verificar que el cazador fue eliminado
      const deletedHunter = await Hunter.findOne({ name: "Geralt" });
      expect(deletedHunter).toBeNull();
    });

    test("should return 404 if hunter name not found", async () => {
      const response = await request(app)
        .delete("/hunters/name/NonExistentHunter")
        .expect(404);

      expect(response.body.error).toBe("No se encontró el cazador");
    });
  });
});

describe("GET /hunters", () => {
  test("should return hunters matching the query", async () => {
    await request(app).post("/hunters").send({
      name: "Iker",
      race: "Human",
      location: "Bosque Oscuro",
    });

    const response = await request(app)
      .get("/hunters?name=Iker")
      .expect(200);

    expect(response.body[0].name).toBe("Iker");
  });

  test("should return 404 if no hunters match the query", async () => {
    const response = await request(app)
      .get("/hunters?name=Fantasma")
      .expect(404);

    expect(response.body.error).toBe("No se encontraron cazadores con esos filtros");
  });
});

describe("PATCH /hunters", () => {
  test("should update a hunter using query string", async () => {
    await request(app).post("/hunters").send({
      name: "Iker",
      race: "Human",
      location: "Bosque Oscuro",
    });

    const response = await request(app)
      .patch("/hunters?name=Iker")
      .send({ location: "Montaña Roja" })
      .expect(200);

    expect(response.body.location).toBe("Montaña Roja");
  });

  test("should return 400 for invalid update field", async () => {
    const response = await request(app)
      .patch("/hunters?name=Iker")
      .send({ arma: "Ballesta" })
      .expect(400);

    expect(response.body.error).toBe("La actualización no está permitida");
  });

  test("should return 404 if hunter not found", async () => {
    const response = await request(app)
      .patch("/hunters?name=Desconocido")
      .send({ location: "Mar Profundo" })
      .expect(404);

    expect(response.body.error).toBe("No se encontró el cazador");
  });
});

describe("DELETE /hunters", () => {
  test("should delete a hunter using query string", async () => {
    await request(app).post("/hunters").send({
      name: "Iker",
      race: "Human",
      location: "Bosque Oscuro",
    });
    const response = await request(app)
      .delete("/hunters?name=Iker")
      .expect(200);
    expect(response.body.name).toBe("Iker");
    // Verificar que el cazador fue eliminado
    const deletedHunter = await Hunter.findOne({ name: "Iker" });
    expect(deletedHunter).toBeNull();
  });
  test("should return 404 if hunter not found", async () => {
    const response = await request(app)
      .delete("/hunters?name=Fantasma")
      .expect(404);

    expect(response.body.error).toBe("No se encontró el cazador para eliminar");
  }
  );
});