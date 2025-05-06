import express from 'express';
import { Hunter } from '../models/hunters.js';
export const APIhunter = express.Router();

/**
 * @route POST /hunters
 * @description Crea un cazador asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.body.name - Nombre del cazador (requerido).
 * @param {string} req.body.race - Raza del cazador (requerido; Options: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead').
 * @param {string} req.body.location - Localización del cazador (requerido).
 *
 * @returns {201 Created} Hunter creado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * POST /hunters
 * {
 *   "name": "Geralt",
 *   "race": "Human",
 *   "location": "Astera"
 * }
 */
APIhunter.post("/hunters", async (req, res) => {
  try {
    const hunter = new Hunter({
      ...req.body
    });

    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters
 * @description Obtiene todos los cazadores
 *
 * @returns {200 OK} Lista de cazadores.
 * @returns {404 Not Found} No hay cazadores registrados.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /hunters
 */
APIhunter.get("/hunters", async (req, res) => {
  try {
    const hunters = await Hunter.find();

    if (hunters.length !== 0) {
      res.send(hunters);
    } else {
      res.status(404).send({
        error: "No hay cazadores registrados",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/:id
 * @description Obtiene un cazador registrado por su ID
 *
 * @param {string} req.params.id - Id del cazador que se quiere consultar.
 *
 * @returns {200 OK} Cazador encontrado.
 * @returns {404 Not Found} No se encontró el cazador.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /hunters/6818e84ab66205e8b1ed04f0
 */
APIhunter.get("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findOne({
      _id: req.params.id,
    });

    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({
        error: "No se encontró el cazador"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/name/:name
 * @description Obtiene un cazador registrado por su nombre
 *
 * @param {string} req.params.name - Nombre del cazador a consultar.
 *
 * @returns {200 OK} Cazador encontrado.
 * @returns {404 Not Found} No se encontró el cazador.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /hunters/name/Geralt
 */
APIhunter.get("/hunters/name/:name", async (req, res) => {
  try {
    const hunter = await Hunter.findOne({
      name: req.params.name
    });

    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({
        error: "No se encontró el cazador"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/location/:location
 * @description Obtiene los cazadores registrados por localización
 *
 * @param {string} req.params.location - localización de los cazadores a consultar.
 *
 * @returns {200 OK} Lista de cazadores en esa localización.
 * @returns {404 Not Found} No hay cazadores en esa localización.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /hunters/location/Astera
 */
APIhunter.get("/hunters/location/:location", async (req, res) => {
  try {
    const hunters = await Hunter.find({
      location: req.params.location
    });

    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({
        error: "No se encontraron cazadores en esa localización"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/race/:race
 * @description Obtiene los cazadores registrados por raza
 *
 * @param {string} req.params.race - Raza de los cazadores a consultar.
 *
 * @returns {200 OK} Lista de cazadores de esa raza.
 * @returns {404 Not Found} No hay cazadores de esa raza.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /hunters/race/Human
 */
APIhunter.get("/hunters/race/:race", async (req, res) => {
  try {
    const hunters = await Hunter.find({
      race: req.params.race
    });

    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({
        error: "No se encontraron cazadores de esa raza"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /hunters/:id
 * @description Actualiza un cazador por su ID
 *
 * @param {string} req.params.id - ID del cazador a actualizar.
 * @param {string} req.body.name - Nombre del cazador.
 * @param {string} req.body.race - Raza del cazador (Options: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead').
 * @param {string} req.body.location - Localización del cazador.
 *
 * @returns {200 OK} Hunter actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {404 Not Found} No se encontró el cazador.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /hunters/6818e84ab66205e8b1ed04f0
 * {
 *   "name": "Geralt",
 *   "race": "Vampire",
 *   "location": "Astera"
 * }
 */
APIhunter.patch("/hunters/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "location", "race"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const hunter = await Hunter.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send({
          error: "No se encontró el cazador"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /hunters/name/:name
 * @description Actualiza un cazador por su nombre
 *
 * @param {string} req.params.name - Nombre del cazador a actualizar.
 * @param {string} req.body.name - Nuevo nombre del cazador.
 * @param {string} req.body.race - Raza del cazador (Options: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead').
 * @param {string} req.body.location - Localización del cazador.
 *
 * @returns {200 OK} Hunter actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {404 Not Found} No se encontró el cazador.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /hunters/name/Geralt
 * {
 *   "name": "Geralt de Rivia",
 *   "race": "Human",
 *   "location": "Kaer Morhen"
 * }
 */
APIhunter.patch("/hunters/name/:name", async (req, res) => {
  try {
    const allowedUpdates = ["name", "location", "race"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const hunter = await Hunter.findOneAndUpdate(
        { name: req.params.name },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send({
          error: "No se encontró el cazador"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /hunters/:id
 * @description Borra a un cazador por su ID
 *
 * @param {string} req.params.id - Id del cazador.
 *
 * @returns {200 OK} Cazador eliminado correctamente.
 * @returns {404 Not Found} No se encontró el cazador.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /hunters/6818e84ab66205e8b1ed04f0
 */
APIhunter.delete("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);

    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({
        error: "No se encontró el cazador"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /hunters/name/:name
 * @description Borra a un cazador por su nombre
 *
 * @param {string} req.params.name - Nombre del cazador.
 *
 * @returns {200 OK} Cazador eliminado correctamente.
 * @returns {404 Not Found} No se encontró el cazador.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /hunters/name/Geralt
 */
APIhunter.delete("/hunters/name/:name", async (req, res) => {
  try {
    const hunter = await Hunter.findOneAndDelete({ name: req.params.name });

    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({
        error: "No se encontró el cazador"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});