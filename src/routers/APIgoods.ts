import express from 'express';
import { Good } from '../models/goods.js';

export const APIgoods = express.Router();

/**
 * @route POST /goods
 * @description Crea un bien asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.body.name - Nombre del bien (requerido).
 * @param {string} req.body.description - Descripción del bien (requerido).
 * @param {string} req.body.category - Categoría del bien (requerido).
 * @param {string} req.body.material - Material del bien (requerido).
 * @param {number} req.body.value - Valor del bien (requerido).
 * @param {number} req.body.stock - Stock del bien (requerido).
 * @param {number} req.body.weight - Peso del bien (requerido).
 *
 * @returns {201 Created} Good creado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * POST /goods
 */
APIgoods.post("/goods", async (req, res) => {
  try {
    const good = new Good({
      ...req.body
    });

    await good.save();
    res.status(201).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods
 * @desc Obtiene todos los bienes
 *
 * @returns {200 OK} Lista de bienes.
 * @returns {404 Not Found} No hay bienes registrados.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /goods
 */
APIgoods.get("/goods", async (req, res) => {
  try {
    const filters = req.query;

    // Si no hay filtros (es decir, la query está vacía)
    if (Object.keys(filters).length === 0) {
      const goods = await Good.find();
      if (goods.length !== 0) {
        res.send(goods);
      } else {
        res.status(404).send({
          error: "No hay bienes registrados",
        });
      }
    } else {
      // Hay filtros: aplicamos query
      const goods = await Good.find(filters);
      if (goods.length > 0) {
        res.send(goods);
      } else {
        res.status(404).send({
          error: "No se encontraron bienes con esos filtros",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:id
 * @description Obtiene un bien registrado por su ID
 *
 * @param {string} req.params.id - Id del bien que se quiere consultar.
 *
 * @returns {200 OK} Cazador encontrado.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /goods/6818e84ab66205e8b1ed04f0
 */
APIgoods.get("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findOne({
      _id: req.params.id,
    });

    if (good) {
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/name/:name
 * @description Obtiene un bien registrado por su nombre
 *
 * @param {string} req.params.name - Nombre del bien a consultar.
 *
 * @returns {200 OK} Cazador encontrado.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /goods/name/Geralt
 */
APIgoods.get("/goods/name/:name", async (req, res) => {
  try {
    const good = await Good.findOne({
      name: req.params.name
    });

    if (good) {
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/category/:category
 * @description Obtiene los bienes registrados por localización
 *
 * @param {string} req.params.category - localización de los bienes a consultar.
 *
 * @returns {200 OK} Lista de bienes de esa categoria.
 * @returns {404 Not Found} No hay bienes de esa categoria.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /goods/category/Weapon
 */
APIgoods.get("/goods/category/:category", async (req, res) => {
  try {
    const goods = await Good.find({
      category: req.params.category
    });

    if (goods.length > 0) {
      res.send(goods);
    } else {
      res.status(404).send({
        error: "No se encontraron bienes de esa categoria"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/material/:material
 * @description Obtiene los bienes de cierto material
 *
 * @param {string} req.params.material - material de los bienes a consultar.
 *
 * @returns {200 OK} Lista de bienes de ese material.
 * @returns {404 Not Found} No hay bienes de ese material.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET /goods/material/Wood
 */
APIgoods.get("/goods/material/:material", async (req, res) => {
  try {
    const goods = await Good.find({
      material: req.params.material
    });

    if (goods.length > 0) {
      res.send(goods);
    } else {
      res.status(404).send({
        error: "No se encontraron bienes de ese material"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /goods/:id
 * @description Actualiza un bien por su ID
 *
 * @param {string} req.body.name - Nombre del bien (requerido).
 * @param {string} req.body.description - Descripción del bien (requerido).
 * @param {string} req.body.category - Categoría del bien (requerido).
 * @param {string} req.body.material - Material del bien (requerido).
 * @param {number} req.body.value - Valor del bien (requerido).
 * @param {number} req.body.stock - Stock del bien (requerido).
 * @param {number} req.body.weight - Peso del bien (requerido).
 *
 * @returns {200 OK} Good actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /goods/6818e84ab66205e8b1ed04f0
 */
APIgoods.patch("/goods/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "description", "category", "material", "value", "stock", "weight"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const good = await Good.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (good) {
        res.send(good);
      } else {
        res.status(404).send({
          error: "No se encontró el bien"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /goods/name/:name
 * @description Actualiza un bien por su nombre
 *
 * @param {string} req.body.name - Nombre del bien (requerido).
 * @param {string} req.body.description - Descripción del bien (requerido).
 * @param {string} req.body.category - Categoría del bien (requerido).
 * @param {string} req.body.material - Material del bien (requerido).
 * @param {number} req.body.value - Valor del bien (requerido).
 * @param {number} req.body.stock - Stock del bien (requerido).
 * @param {number} req.body.weight - Peso del bien (requerido).
 *
 * @returns {200 OK} Good actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /goods/name/Geralt
 */
APIgoods.patch("/goods/name/:name", async (req, res) => {
  try {
    const allowedUpdates = ["name", "description", "category", "material", "value", "stock", "weight"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const good = await Good.findOneAndUpdate(
        { name: req.params.name },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (good) {
        res.send(good);
      } else {
        res.status(404).send({
          error: "No se encontró el bien"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /goods/:id
 * @description Borra a un bien por su ID
 *
 * @param {string} req.params.id - Id del bien.
 *
 * @returns {200 OK} Objeto eliminado correctamente.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /goods/6818e84ab66205e8b1ed04f0
 */
APIgoods.delete("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findByIdAndDelete(req.params.id);

    if (good) {
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /goods/name/:name
 * @description Borra a un bien por su nombre
 *
 * @param {string} req.params.name - Nombre del bien.
 *
 * @returns {200 OK} objeto eliminado correctamente.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /goods/name/Diamante
 */
APIgoods.delete("/goods/name/:name", async (req, res) => {
  try {
    const good = await Good.findOneAndDelete({ name: req.params.name });

    if (good) {
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /goods/query
 * @description Actualiza un bien utilizando query strings como filtro.
 *
 * @param {object} req.query - Filtros para buscar el bien (ej. name=Espada).
 * @param {object} req.body - Campos a actualizar.
 *
 * @returns {200 OK} Bien actualizado.
 * @returns {400 Bad Request} Actualización inválida.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * PATCH /goods/query?name=Espada
 */
APIgoods.patch("/goods", async (req, res) => {
  try {
    const allowedUpdates = ["name", "description", "category", "material", "value", "stock", "weight"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida"
      });
    } else {
      const good = await Good.findOneAndUpdate(
        req.query,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (good) {
        res.send(good);
      } else {
        res.status(404).send({
          error: "No se encontró el bien"
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /goods
 * @description Elimina un bien utilizando query strings como filtro.
 *
 * @param {object} req.query - Filtros para encontrar el bien (ej. name=Espada).
 *
 * @returns {200 OK} Bien eliminado.
 * @returns {404 Not Found} No se encontró el bien.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE /goods?name=Espada
 */
APIgoods.delete("/goods", async (req, res) => {
  try {
    const good = await Good.findOneAndDelete(req.query);

    if (good) {
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien para eliminar"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});