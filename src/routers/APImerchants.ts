import express from 'express';
import { Merchant } from '../models/merchant.js';

export const APImerchant = express.Router();

/**
 * @route POST /merchant
 * @description Crea un mercader asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.body.name - Nombre del mercader (requerido).
 * @param {string} req.body.type - Tipo del mercader (requerido; Options: 'Blacksmith' | 'Alchemist' | 'Armorer' | 'Herbalist' | 'General Goods' | 'Weapons' | 'Other').
 * @param {string} req.body.location - Localización del mercader (requerido).
 *
 * @returns {201 Created} Hunter creado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * POST /merchants
 * {
 *   "name": "Geralt",
 *   "type": "General",
 *   "location": "Astera"
 * }
 */
APImerchant.post("/merchants", async (req, res) => {
  try {
    const merchant = new Merchant({
      ...req.body
    });

    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants
 * @description Obtiene todos los mercaderes
 *
 * @returns {200 OK} Lista de mercaderes.
 * @returns {404 Not Found} No hay mercaderes registrados.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /merchants
 */
APImerchant.get("/merchants", async (req, res) => {
  try {
    const filters = req.query;

    // Si no hay filtros (es decir, la query está vacía)
    if (Object.keys(filters).length === 0) {
      const merchants = await Merchant.find();
      if (merchants.length !== 0) {
        res.send(merchants);
      } else {
        res.status(404).send({
          error: "No hay mercaderes registrados",
        });
      }
    } else {
      // Hay filtros: aplicamos query
      const merchants = await Merchant.find(filters);
      if (merchants.length > 0) {
        res.send(merchants);
      } else {
        res.status(404).send({
          error: "No se encontraron merchants con esos filtros",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants/:id
 * @description Obtiene un mercader registrado por su ID
 *
 * @param {string} req.params.id - Id del mercader que se quiere consultar.
 *
 * @returns {200 OK} Mercader encontrado.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /merchant/6818e84ab66205e8b1ed04f0
 */
APImerchant.get("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      _id: req.params.id,
    });

    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró el mercader"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchant/name/:name
 * @description Obtiene un mercader registrado por su nombre
 *
 * @param {string} req.params.name - Nombre del mercader a consultar.
 *
 * @returns {200 OK} Mercader encontrado.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /merchant/name/Geralt
 */
APImerchant.get("/merchants/name/:name", async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      name: req.params.name
    });

    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró el mercader"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants/location/:location
 * @description Obtiene los mercaderes registrados por localización
 *
 * @param {string} req.params.location - localización de los mercaderes a consultar.
 *
 * @returns {200 OK} Lista de mercaderes en esa localización.
 * @returns {404 Not Found} No hay mercaderes en esa localización.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /merchants/location/Astera
 */
APImerchant.get("/merchants/location/:location", async (req, res) => {
  try {
    const merchants = await Merchant.find({
      location: req.params.location
    });

    if (merchants.length > 0) {
      res.send(merchants);
    } else {
      res.status(404).send({
        error: "No se encontraron mercaderes en esa localización"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants/type/:type
 * @description Obtiene los mercaderes registrados por tipo
 *
 * @param {string} req.params.type - Tipo de los mercaderes a consultar.
 *
 * @returns {200 OK} Lista de mercaderes de ese tipo.
 * @returns {404 Not Found} No hay mercaderes de ese tipo.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /merchants/type/Alchemist
 */
APImerchant.get("/merchants/type/:type", async (req, res) => {
  try {
    const merchants = await Merchant.find({
      type: req.params.type
    });

    if (merchants.length > 0) {
      res.send(merchants);
    } else {
      res.status(404).send({
        error: "No se encontraron mercaderes de esa raza"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /merchants/:id
 * @description Actualiza un mecader por su ID
 *
 * @param {string} req.params.id - ID del mercader a actualizar.
 * @param {string} req.body.name - Nombre del mercader.
 * @param {string} req.body.type - Tipo del mercader (Options: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead').
 * @param {string} req.body.location - Localización del mercader.
 *
 * @returns {200 OK} Merchant actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /merchants/6818e84ab66205e8b1ed04f0
 * {
 *   "name": "Geralt",
 *   "type": "Armorer",
 *   "location": "Astera"
 * }
 */
APImerchant.patch("/merchants/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "type", "location"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const merchant = await Merchant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró el mercader"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /merchants/name/:name
 * @description Actualiza un mercader por su nombre
 *
 * @param {string} req.params.name - Nombre del mercader a actualizar.
 * @param {string} req.body.name - Nuevo nombre del mercader.
 * @param {string} req.body.type - Tipo del mercader (Options: 'Blacksmith' | 'Alchemist' | 'Armorer' | 'Herbalist' | 'General Goods' | 'Weapons' | 'Other').
 * @param {string} req.body.location - Localización del mercader.
 *
 * @returns {200 OK} Hunter actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /merchant/name/Geralt
 * {
 *   "name": "Geralt de Rivia",
 *   "type": "Blacksmith",
 *   "location": "Kaer Morhen"
 * }
 */
APImerchant.patch("/merchants/name/:name", async (req, res) => {
  try {
    const allowedUpdates = ["name", "type", "location"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const merchant = await Merchant.findOneAndUpdate(
        { name: req.params.name },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró el mercader"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /merchant/:id
 * @description Borra a un mercader por su ID
 *
 * @param {string} req.params.id - Id del mercader.
 *
 * @returns {200 OK} Mercader eliminado correctamente.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /merchant/6818e84ab66205e8b1ed04f0
 */
APImerchant.delete("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);

    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró el mercader"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /merchants/name/:name
 * @description Borra a un mercader por su nombre
 *
 * @param {string} req.params.name - Nombre del mercader.
 *
 * @returns {200 OK} Mercader eliminado correctamente.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /merchants/name/Geralt
 */
APImerchant.delete("/merchants/name/:name", async (req, res) => {
  try {
    const merchant = await Merchant.findOneAndDelete({ name: req.params.name });

    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró el mercader"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /merchants
 * @description Actualiza un mercader utilizando query strings como filtro.
 *
 * @param {object} req.query - Filtros para buscar el mercader (ej. name=Iker).
 * @param {object} req.body - Campos a actualizar.
 *
 * @returns {200 OK} Bien actualizado.
 * @returns {400 Bad Request} Actualización inválida.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /merchants?name=Iker
 */
APImerchant.patch("/merchants", async (req, res) => {
  try {
    const allowedUpdates = ["name", "type", "location"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const merchant = await Merchant.findOneAndUpdate(
        req.query,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró el mercader"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /merchants
 * @description Elimina un mercaer utilizando query strings como filtro.
 *
 * @param {object} req.query - Filtros para encontrar el mercader (ej. name=Iker).
 *
 * @returns {200 OK} Cazador eliminado.
 * @returns {404 Not Found} No se encontró el mercader.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /merchants?name=Iker
 */
APImerchant.delete("/merchants", async (req, res) => {
  try {
    const merchant = await Merchant.findOneAndDelete(req.query);

    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró el mercader para eliminar"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});