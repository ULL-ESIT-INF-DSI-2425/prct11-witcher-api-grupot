/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js'; // Asegúrate de que la ruta sea correcta
import { Good } from '../src/models/goods.js'; // Asegúrate de que la ruta sea correcta

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

// Después de cada prueba, limpiamos la colección de bienes
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Good.deleteMany({});
  }
});

// Después de todas las pruebas, mantenemos la conexión abierta
// para evitar conflictos con otras pruebas o con el servidor
// afterAll(async () => {
//   // No cerramos la conexión para evitar problemas con otras pruebas
//   // Si realmente necesitas cerrarla, asegúrate de que no haya otras pruebas ejecutándose
//   // await mongoose.connection.close();
// });

describe("Goods API Tests", () => {
  // TEST: Creación de un bien
  describe("POST /goods", () => {
    test("should create a new good", async () => {
      const response = await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        })
        .expect(201);

      // Verificamos que el bien se creó correctamente
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Espada de Plata");
      expect(response.body.description).toBe("Espada para matar monstruos");
      expect(response.body.category).toBe("Weapon");
      expect(response.body.material).toBe("Silver");
      expect(response.body.value).toBe(1000);
      expect(response.body.stock).toBe(1);
      expect(response.body.weight).toBe(3);
    });
  });

  // TEST: Obtener todos los bienes
  describe("GET /goods", () => {
    test("should return all goods", async () => {
      // Crear un bien primero
      await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      // Obtener todos los bienes
      const response = await request(app)
        .get("/goods")
        .expect(200);

      // Verificamos que devuelve una lista con al menos un bien
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("name");
    });

    test("should return 404 if no goods exist", async () => {
      // Aseguramos que no hay bienes en la base de datos
      await Good.deleteMany({});

      // Intentamos obtener bienes
      const response = await request(app)
        .get("/goods")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No hay bienes registrados");
    });
  });

  // TEST: Obtener un bien por ID
  describe("GET /goods/:id", () => {
    test("should return a good by ID", async () => {
      // Crear un bien primero
      const createResponse = await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      const goodId = createResponse.body._id;

      // Obtener el bien por ID
      const response = await request(app)
        .get(`/goods/${goodId}`)
        .expect(200);

      // Verificamos que devuelve el bien correcto
      expect(response.body).toHaveProperty("_id");
      expect(response.body._id).toBe(goodId);
      expect(response.body.name).toBe("Espada de Plata");
    });

    test("should return 404 if good ID doesn't exist", async () => {
      // ID inválido (pero con formato válido de MongoDB)
      const invalidId = new mongoose.Types.ObjectId();

      // Intentamos obtener un bien con ID inválido
      const response = await request(app)
        .get(`/goods/${invalidId}`)
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el bien");
    });
  });

  // TEST: Obtener un bien por nombre
  describe("GET /goods/name/:name", () => {
    test("should return a good by name", async () => {
      // Crear un bien primero
      await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      // Obtener el bien por nombre
      const response = await request(app)
        .get("/goods/name/Espada de Plata")
        .expect(200);

      // Verificamos que devuelve el bien correcto
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Espada de Plata");
    });

    test("should return 404 if good name doesn't exist", async () => {
      // Intentamos obtener un bien con nombre inválido
      const response = await request(app)
        .get("/goods/name/Arma Inexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el bien");
    });
  });

  // TEST: Obtener bienes por categoría
  describe("GET /goods/category/:category", () => {
    test("should return goods by category", async () => {
      // Crear bienes de diferentes categorías
      await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      await request(app)
        .post("/goods")
        .send({
          name: "Daga de Hierro",
          description: "Daga pequeña",
          category: "Weapon",
          material: "Iron",
          value: 500,
          stock: 3,
          weight: 1
        });

      // Obtener bienes por categoría
      const response = await request(app)
        .get("/goods/category/Weapon")
        .expect(200);

      // Verificamos que devuelve los bienes correctos
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].category).toBe("Weapon");
      expect(response.body[1].category).toBe("Weapon");
    });

    test("should return 404 if no goods with that category exist", async () => {
      // Intentamos obtener bienes con categoría inexistente
      const response = await request(app)
        .get("/goods/category/CategoriaInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontraron bienes de esa categoria");
    });
  });

  // TEST: Obtener bienes por material
  describe("GET /goods/material/:material", () => {
    test("should return goods by material", async () => {
      // Crear bienes de diferentes materiales
      await request(app)
        .post("/goods")
        .send({
          name: "Espada de Madera",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Wood",
          value: 1000,
          stock: 1,
          weight: 3
        });

      await request(app)
        .post("/goods")
        .send({
          name: "Bastón poderoso",
          description: "Antiguo bastón mítico",
          category: "Weapon",
          material: "Wood",
          value: 300,
          stock: 5,
          weight: 0.1
        });

      // Obtener bienes por material
      const response = await request(app)
        .get("/goods/material/Wood")
        .expect(200);

      // Verificamos que devuelve los bienes correctos
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].material).toBe("Wood");
      expect(response.body[1].material).toBe("Wood");
    });

    test("should return 404 if no goods with that material exist", async () => {
      // Intentamos obtener bienes con material inexistente
      const response = await request(app)
        .get("/goods/material/MaterialInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontraron bienes de ese material");
    });
  });

  // TEST: Actualizar un bien por ID
  describe("PATCH /goods/:id", () => {
    test("should update a good by ID", async () => {
      // Crear un bien primero
      const createResponse = await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      const goodId = createResponse.body._id;

      // Actualizar el bien
      const response = await request(app)
        .patch(`/goods/${goodId}`)
        .send({
          name: "Espada de Plata Mejorada",
          value: 1500,
          stock: 2
        })
        .expect(200);

      // Verificamos que el bien se actualizó correctamente
      expect(response.body).toHaveProperty("_id");
      expect(response.body._id).toBe(goodId);
      expect(response.body.name).toBe("Espada de Plata Mejorada");
      expect(response.body.value).toBe(1500);
      expect(response.body.stock).toBe(2);
      // Verificamos que los campos no actualizados se mantienen
      expect(response.body.description).toBe("Espada para matar monstruos");
      expect(response.body.category).toBe("Weapon");
      expect(response.body.material).toBe("Silver");
      expect(response.body.weight).toBe(3);
    });

    test("should return 400 if update is not allowed", async () => {
      // Crear un bien primero
      const createResponse = await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      const goodId = createResponse.body._id;

      // Intentar actualizar con campo no permitido
      const response = await request(app)
        .patch(`/goods/${goodId}`)
        .send({
          name: "Espada de Plata Mejorada",
          campoInvalido: "Este campo no está permitido"
        })
        .expect(400);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("La actualización no está permitida");
    });

    test("should return 404 if good ID doesn't exist", async () => {
      // ID inválido (pero con formato válido de MongoDB)
      const invalidId = new mongoose.Types.ObjectId();

      // Intentamos actualizar un bien con ID inválido
      const response = await request(app)
        .patch(`/goods/${invalidId}`)
        .send({
          name: "Nombre Actualizado"
        })
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el bien");
    });
  });

  // TEST: Actualizar un bien por nombre
  describe("PATCH /goods/name/:name", () => {
    test("should update a good by name", async () => {
      // Crear un bien primero
      await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      // Actualizar el bien por nombre
      const response = await request(app)
        .patch("/goods/name/Espada de Plata")
        .send({
          name: "Espada de Plata Mejorada",
          value: 1500,
          stock: 2
        })
        .expect(200);

      // Verificamos que el bien se actualizó correctamente
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Espada de Plata Mejorada");
      expect(response.body.value).toBe(1500);
      expect(response.body.stock).toBe(2);
      // Verificamos que los campos no actualizados se mantienen
      expect(response.body.description).toBe("Espada para matar monstruos");
      expect(response.body.category).toBe("Weapon");
      expect(response.body.material).toBe("Silver");
      expect(response.body.weight).toBe(3);
    });

    test("should return 404 if good name doesn't exist", async () => {
      // Intentamos actualizar un bien con nombre inválido
      const response = await request(app)
        .patch("/goods/name/NombreInexistente")
        .send({
          value: 1500
        })
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el bien");
    });
  });

  // TEST: Eliminar un bien por ID
  describe("DELETE /goods/:id", () => {
    test("should delete a good by ID", async () => {
      // Crear un bien primero
      const createResponse = await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      const goodId = createResponse.body._id;

      // Eliminar el bien
      const response = await request(app)
        .delete(`/goods/${goodId}`)
        .expect(200);

      // Verificamos que devuelve el bien eliminado
      expect(response.body).toHaveProperty("_id");
      expect(response.body._id).toBe(goodId);
      expect(response.body.name).toBe("Espada de Plata");

      // Verificamos que el bien ya no existe en la base de datos
      const getResponse = await request(app)
        .get(`/goods/${goodId}`)
        .expect(404);
    });

    test("should return 404 if good ID doesn't exist", async () => {
      // ID inválido (pero con formato válido de MongoDB)
      const invalidId = new mongoose.Types.ObjectId();

      // Intentamos eliminar un bien con ID inválido
      const response = await request(app)
        .delete(`/goods/${invalidId}`)
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el bien");
    });
  });

  // TEST: Eliminar un bien por nombre
  describe("DELETE /goods/name/:name", () => {
    test("should delete a good by name", async () => {
      // Crear un bien primero
      await request(app)
        .post("/goods")
        .send({
          name: "Espada de Plata",
          description: "Espada para matar monstruos",
          category: "Weapon",
          material: "Silver",
          value: 1000,
          stock: 1,
          weight: 3
        });

      // Eliminar el bien por nombre
      const response = await request(app)
        .delete("/goods/name/Espada de Plata")
        .expect(200);

      // Verificamos que devuelve el bien eliminado
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Espada de Plata");

      // Verificamos que el bien ya no existe en la base de datos
      const getResponse = await request(app)
        .get("/goods/name/Espada de Plata")
        .expect(404);
    });

    test("should return 404 if good name doesn't exist", async () => {
      // Intentamos eliminar un bien con nombre inválido
      const response = await request(app)
        .delete("/goods/name/NombreInexistente")
        .expect(404);

      // Verificamos el mensaje de error
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No se encontró el bien");
    });
  });
});

describe("GET /goods with querys", () => {
  test("should return goods matching the query", async () => {
    await request(app).post("/goods").send({
      name: "Espada Larga",
      description: "A fine weapon",
      category: "Weapon",
      material: "Steel",
      value: 300,
      stock: 5,
      weight: 4,
    });

    const response = await request(app)
      .get("/goods?name=Espada Larga")
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toBe("Espada Larga");
  });

  test("should return 404 if no goods match the query", async () => {
    const response = await request(app)
      .get("/goods?name=NoExiste")
      .expect(404);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No se encontraron bienes con esos filtros");
  });
});

describe("PATCH /goods with query", () => {
  test("should update a good using query string", async () => {
    await request(app).post("/goods").send({
      name: "Espada Rota",
      description: "A not so fine weapon",
      category: "Weapon",
      material: "Iron",
      value: 50,
      stock: 2,
      weight: 3,
    });

    const response = await request(app)
      .patch("/goods?name=Espada Rota")
      .send({ value: 75 })
      .expect(200);

    expect(response.body.name).toBe("Espada Rota");
    expect(response.body.value).toBe(75);
  });

  test("should return 400 if update contains invalid field", async () => {
    await request(app).post("/goods").send({
      name: "Espada Mágica",
      description: "A quite fine weapon",
      category: "Weapon",
      material: "Silver",
      value: 1000,
      stock: 1,
      weight: 2,
    });

    const response = await request(app)
      .patch("/goods?name=Espada Mágica")
      .send({ magia: true })
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("La actualización no está permitida");
  });

  test("should return 404 if no good matches query", async () => {
    const response = await request(app)
      .patch("/goods?name=Inexistente")
      .send({ value: 999 })
      .expect(404);

    expect(response.body.error).toBe("No se encontró el bien");
  });
});

describe("DELETE /goods with querys", () => {
  test("should delete a good using query string", async () => {
    await request(app).post("/goods").send({
      name: "Espada Vieja",
      description: "A rusty weapon",
      category: "Weapon",
      material: "Wood",
      value: 20,
      stock: 1,
      weight: 1,
    });

    const response = await request(app)
      .delete("/goods?name=Espada Vieja")
      .expect(200);

    expect(response.body.name).toBe("Espada Vieja");

    // Verificamos que el bien ya no existe
    const getResponse = await request(app)
      .get("/goods?name=Espada Vieja")
      .expect(404);

    expect(getResponse.body.error).toBe("No se encontraron bienes con esos filtros");
  });

  test("should return 404 if no good matches query", async () => {
    const response = await request(app)
      .delete("/goods?name=Inexistente")
      .expect(404);

    expect(response.body.error).toBe("No se encontró el bien para eliminar");
  });
});