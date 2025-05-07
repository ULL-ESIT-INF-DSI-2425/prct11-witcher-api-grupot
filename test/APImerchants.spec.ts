import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { Merchant } from '../src/models/merchant.js';

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

// Después de cada prueba, limpiamos la colección de mercaderes
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Merchant.deleteMany({});
  }
});

describe("Merchants API Tests", () => {
  // TEST: Creación de un mercader
  describe("POST /merchants", () => {
    test("should create a new merchant", async () => {
      const response = await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        })
        .expect(201);

      // Verificamos que el mercader se creó correctamente
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Gremist");
      expect(response.body.type).toBe("Alchemist");
      expect(response.body.location).toBe("Skellige");
    });
  });

  // TEST: Obtener todos los mercaderes
  describe("GET /merchants", () => {
    test("should return all merchants", async () => {
      // Crear un mercader primero
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      // Obtener todos los mercaderes
      const response = await request(app)
        .get("/merchants")
        .expect(200);

      // Verificamos que devuelve una lista con al menos un mercader
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("name");
    });

    test("should return 404 if no merchants exist", async () => {
      // Aseguramos que no hay mercaderes en la base de datos
      await Merchant.deleteMany({});

      // Intentamos obtener mercaderes
      const response = await request(app)
        .get("/merchants")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No hay mercaderes registrados");
    });
  });

  // TEST: Obtener un mercader por ID
  describe("GET /merchants/:id", () => {
    test("should return a merchant by ID", async () => {
      // Crear un mercader primero
      const createResponse = await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      const merchantId = createResponse.body._id;

      // Obtener el mercader por ID
      const response = await request(app)
        .get(`/merchants/${merchantId}`)
        .expect(200);

      // Verificamos que devuelve el mercader correcto
      expect(response.body).toHaveProperty("_id");
      expect(response.body._id).toBe(merchantId);
      expect(response.body.name).toBe("Gremist");
    });

    test("should return 404 if merchant ID doesn't exist", async () => {
      // ID inválido (pero con formato válido de MongoDB)
      const invalidId = new mongoose.Types.ObjectId();

      // Intentamos obtener un mercader con ID inválido
      const response = await request(app)
        .get(`/merchants/${invalidId}`)
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el mercader");
    });
  });

  // TEST: Obtener un mercader por nombre
  describe("GET /merchants/name/:name", () => {
    test("should return a merchant by name", async () => {
      // Crear un mercader primero
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      // Obtener el mercader por nombre
      const response = await request(app)
        .get("/merchants/name/Gremist")
        .expect(200);

      // Verificamos que devuelve el mercader correcto
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Gremist");
    });

    test("should return 404 if merchant name doesn't exist", async () => {
      // Intentamos obtener un mercader con nombre inválido
      const response = await request(app)
        .get("/merchants/name/NombreInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el mercader");
    });
  });

  // TEST: Obtener mercaderes por localización
  describe("GET /merchants/location/:location", () => {
    test("should return merchants by location", async () => {
      // Crear mercaderes en diferentes ubicaciones
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      await request(app)
        .post("/merchants")
        .send({
          name: "Hattori",
          type: "Blacksmith",
          location: "Novigrad"
        });

      await request(app)
        .post("/merchants")
        .send({
          name: "Yoana",
          type: "Armorer",
          location: "Novigrad"
        });

      // Obtener mercaderes por localización
      const response = await request(app)
        .get("/merchants/location/Novigrad")
        .expect(200);

      // Verificamos que devuelve los mercaderes correctos
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].location).toBe("Novigrad");
      expect(response.body[1].location).toBe("Novigrad");
    });

    test("should return 404 if no merchants in that location exist", async () => {
      // Intentamos obtener mercaderes con localización inexistente
      const response = await request(app)
        .get("/merchants/location/UbicacionInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontraron mercaderes en esa localización");
    });
  });

  // TEST: Obtener mercaderes por raza (hay un error en la API - debería ser tipo)
  describe("GET /merchants/type/:type", () => {
    test("should return merchants by type (should be type)", async () => {
      // Crear mercaderes de diferentes tipos/razas
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      await request(app)
        .post("/merchants")
        .send({
          name: "Hattori",
          type: "Alchemist",
          location: "Novigrad"
        });

      // Obtener mercaderes por tipo
      const response = await request(app)
        .get("/merchants/type/Alchemist")
        .expect(200);

      // Verificamos que devuelve los mercaderes correctos
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe("Gremist");
      expect(response.body[0].type).toBe("Alchemist");
      expect(response.body[1].name).toBe("Hattori");
      expect(response.body[1].type).toBe("Alchemist");
    });

    test("should return 404 if no merchants of that type exist", async () => {
      // Intentamos obtener mercaderes con raza/tipo inexistente
      const response = await request(app)
        .get("/merchants/type/TipoInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontraron mercaderes de esa raza");
    });
  });

  // TEST: Actualizar un mercader por ID
  describe("PATCH /merchants/:id", () => {
    test("should update a merchant by ID", async () => {
      // Crear un mercader primero
      const createResponse = await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      const merchantId = createResponse.body._id;

      // Actualizar el mercader
      const response = await request(app)
        .patch(`/merchants/${merchantId}`)
        .send({
          name: "Gremist el Alquimista",
          type: "Alchemist",
          location: "Ard Skellig"
        })
        .expect(200);

      // Verificamos que el mercader se actualizó correctamente
      expect(response.body._id).toBe(merchantId);
      expect(response.body.name).toBe("Gremist el Alquimista");
      expect(response.body.type).toBe("Alchemist");
      expect(response.body.location).toBe("Ard Skellig");
    });

    test("should return 400 if update fields are invalid", async () => {
      // Crear un mercader primero
      const createResponse = await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      const merchantId = createResponse.body._id;

      // Intentar actualizar con campos no permitidos
      const response = await request(app)
        .patch(`/merchants/${merchantId}`)
        .send({
          invalidField: "Valor inválido"
        })
        .expect(400);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("La actualización no está permitida");
    });

    test("should return 404 if merchant ID to update doesn't exist", async () => {
      // ID inválido (pero con formato válido de MongoDB)
      const invalidId = new mongoose.Types.ObjectId();

      // Intentamos actualizar un mercader con ID inválido
      const response = await request(app)
        .patch(`/merchants/${invalidId}`)
        .send({
          name: "Nombre Actualizado"
        })
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el mercader");
    });
  });

  // TEST: Actualizar un mercader por nombre
  describe("PATCH /merchants/name/:name", () => {
    test("should update a merchant by name", async () => {
      // Crear un mercader primero
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      // Actualizar el mercader por nombre
      const response = await request(app)
        .patch("/merchants/name/Gremist")
        .send({
          name: "Gremist el Maestro",
          type: "Alchemist",
          location: "Ard Skellig"
        })
        .expect(200);

      // Verificamos que el mercader se actualizó correctamente
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Gremist el Maestro");
      expect(response.body.type).toBe("Alchemist");
      expect(response.body.location).toBe("Ard Skellig");
    });

    test("should return 400 if update fields are invalid", async () => {
      // Crear un mercader primero
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      // Intentar actualizar con campos no permitidos
      const response = await request(app)
        .patch("/merchants/name/Gremist")
        .send({
          invalidField: "Valor inválido"
        })
        .expect(400);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("La actualización no está permitida");
    });

    test("should return 404 if merchant name to update doesn't exist", async () => {
      // Intentamos actualizar un mercader con nombre inválido
      const response = await request(app)
        .patch("/merchants/name/NombreInexistente")
        .send({
          name: "Nombre Actualizado"
        })
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el mercader");
    });
  });

  // TEST: Eliminar un mercader por ID
  describe("DELETE /merchants/:id", () => {
    test("should delete a merchant by ID", async () => {
      // Crear un mercader primero
      const createResponse = await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      const merchantId = createResponse.body._id;

      // Eliminar el mercader
      const response = await request(app)
        .delete(`/merchants/${merchantId}`)
        .expect(200);

      // Verificamos que el mercader eliminado es el correcto
      expect(response.body._id).toBe(merchantId);
      expect(response.body.name).toBe("Gremist");

      // Verificamos que el mercader ya no existe en la base de datos
      const checkResponse = await request(app)
        .get(`/merchants/${merchantId}`)
        .expect(404);

      expect(checkResponse.body).toHaveProperty("error");
    });

    test("should return 404 if merchant ID to delete doesn't exist", async () => {
      // ID inválido (pero con formato válido de MongoDB)
      const invalidId = new mongoose.Types.ObjectId();

      // Intentamos eliminar un mercader con ID inválido
      const response = await request(app)
        .delete(`/merchants/${invalidId}`)
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el mercader");
    });
  });

  // TEST: Eliminar un mercader por nombre
  describe("DELETE /merchants/name/:name", () => {
    test("should delete a merchant by name", async () => {
      // Crear un mercader primero
      await request(app)
        .post("/merchants")
        .send({
          name: "Gremist",
          type: "Alchemist",
          location: "Skellige"
        });

      // Eliminar el mercader por nombre
      const response = await request(app)
        .delete("/merchants/name/Gremist")
        .expect(200);

      // Verificamos que el mercader eliminado es el correcto
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Gremist");

      // Verificamos que el mercader ya no existe en la base de datos
      const checkResponse = await request(app)
        .get("/merchants/name/Gremist")
        .expect(404);

      expect(checkResponse.body).toHaveProperty("error");
    });

    test("should return 404 if merchant name to delete doesn't exist", async () => {
      // Intentamos eliminar un mercader con nombre inválido
      const response = await request(app)
        .delete("/merchants/name/NombreInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el mercader");
    });
  });
});


describe("GET /merchants", () => {
  test("should return merchants matching the query", async () => {
    await request(app).post("/merchants").send({
      name: "Iker",
      type: "General Goods",
      location: "Bosque Oscuro",
    });

    const response = await request(app)
      .get("/merchants?name=Iker")
      .expect(200);

    expect(response.body[0].name).toBe("Iker");
  });

  test("should return 404 if no merchants match the query", async () => {
    const response = await request(app)
      .get("/merchants?name=Fantasma")
      .expect(404);

    expect(response.body.error).toBe("No se encontraron merchants con esos filtros");
  });
});

describe("PATCH /merchants", () => {
  test("should update a hunter using query string", async () => {
    await request(app).post("/merchants").send({
      name: "Iker",
      type: "General Goods",
      location: "Bosque Oscuro",
    });

    const response = await request(app)
      .patch("/merchants?name=Iker")
      .send({ location: "Montaña Roja" })
      .expect(200);

    expect(response.body.location).toBe("Montaña Roja");
  });

  test("should return 400 for invalid update field", async () => {
    const response = await request(app)
      .patch("/merchants?name=Iker")
      .send({ arma: "Ballesta" })
      .expect(400);

    expect(response.body.error).toBe("La actualización no está permitida");
  });

  test("should return 404 if hunter not found", async () => {
    const response = await request(app)
      .patch("/merchants?name=Desconocido")
      .send({ location: "Mar Profundo" })
      .expect(404);

    expect(response.body.error).toBe("No se encontró el mercader");
  });
});

describe("DELETE /merchants", () => {
  test("should delete a hunter using query string", async () => {
    await request(app).post("/merchants").send({
      name: "Iker",
      type: "General Goods",
      location: "Bosque Oscuro",
    });
    const response = await request(app)
      .delete("/merchants?name=Iker")
      .expect(200);
    expect(response.body.name).toBe("Iker");
    // Verificar que el cazador fue eliminado
    const deletedMerchant = await Merchant.findOne({ name: "Iker" });
    expect(deletedMerchant).toBeNull();
  });
  test("should return 404 if hunter not found", async () => {
    const response = await request(app)
      .delete("/merchants?name=Fantasma")
      .expect(404);

    expect(response.body.error).toBe("No se encontró el mercader para eliminar");
  }
  );
});