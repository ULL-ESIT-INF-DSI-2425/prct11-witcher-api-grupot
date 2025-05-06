import express from 'express';
import { Good } from '../models/goods.js';
import { User } from "../models/users.js";
export const APIgoods = express.Router();

/**
 * @route POST /goods/:username
 * @description Crea un bien asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {number} req.body.name - Nombre del objeto (requerido).
 * @param {string} req.body.description - Descripción del objeto (requerido).
 * @param {string} req.body.category - Categoría del objeto (requerido).
 * @param {string} req.body.material - Material del objeto (requerido).
 * @param {number} req.body.value - Valor del objeto (requerido).
 * @param {number} req.body.stock - Cantidad de objetos (requerido).
 * @param {number} req.body.weight - Peso del objeto (requerido).
 *
 * @returns {201 Created} Good creado o actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {401 Unauthorized} Token de autenticación no proporcionado o inválido.
 *
 * @example
 * POST /goods/john_doe
 * {
 *   "name": Geralt,
 *   "description": "Espada de acero",
 *   "category": "Weapon",
 *   "material": "Acero",
 *   "value": 100,
 *   "stock": 10,
 *   "weight": 1.5
 * }
 */
APIgoods.post("/goods/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = new Good({
        ...req.body,
        owner: user._id,
      });

      await good.save();
      await good.populate({
        path: "owner",
        select: ["username"],
      });
      res.status(201).send(good);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:username
 * @description Obtiene todos los bienes asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 *
 * @returns {200 OK} Goods recibidos correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {401 Unauthorized} Token de autenticación no proporcionado o inválido.
 *
 * @example
 * POST /goods/john_doe
 */
APIgoods.get("/goods/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.find({
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good.length !== 0) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:username/:id
 * @description Obtiene un objeto específico por su ID.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - ID del objeto.
 *
 * @returns {200 OK} Objeto encontrado.
 * @returns {404 Not Found} Usuario u objeto no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APIgoods.get("/goods/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOne({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:username/:name
 * @description Busca un objeto por su nombre.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.name - Nombre del objeto.
 *
 * @returns {200 OK} Objeto encontrado.
 * @returns {404 Not Found} Usuario o objeto no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APIgoods.get("/goods/:username/:name", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOne({
        owner: user._id,
        _id: req.params.name,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:username/:category
 * @description Busca un objeto por su categoría.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.category - Categoria del objeto.
 *
 * @returns {200 OK} Objeto encontrado.
 * @returns {404 Not Found} Usuario u objeto no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APIgoods.get("/goods/:username/:category", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOne({
        owner: user._id,
        _id: req.params.category,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:username/:material
 * @description Busca un objeto por su material.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.material - Material del objeto.
 *
 * @returns {200 OK} Objeto encontrado.
 * @returns {404 Not Found} Usuario u objeto no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APIgoods.get("/goods/:username/:material", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOne({
        owner: user._id,
        _id: req.params.material,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /goods/:username/:id
 * @description Actualiza los datos de un bien por ID.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {number} req.body.name - Nombre del objeto.
 * @param {string} req.body.description - Descripción del objeto.
 * @param {string} req.body.category - Categoría del objeto.
 * @param {string} req.body.material - Material del objeto.
 * @param {number} req.body.value - Valor del objeto.
 * @param {number} req.body.stock - Cantidad de objetos.
 * @param {number} req.body.weight - Peso del objeto.
 *
 * @returns {200 OK} Bien actualizado correctamente.
 * @returns {400 Bad Request} Campos inválidos para actualización.
 * @returns {404 Not Found} Usuario o bien no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APIgoods.patch("/goods/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const allowedUpdates = ["name", "description", "category", "material", "value", "stock", "weight"];
      const actualUpdates = Object.keys(req.body);
      const isValidUpdate = actualUpdates.every((update) =>
        allowedUpdates.includes(update),
      );

      if (!isValidUpdate) {
        res.status(400).send({
          error: "La actualización no está permitida",
        });
      } else {
        const good = await Good.findOneAndUpdate(
          {
            owner: user._id,
            _id: req.params.id,
          },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        ).populate({
          path: "owner",
          select: ["username"],
        });

        if (good) {
          res.send(good);
        } else {
          res.status(404).send();
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /goods/:username/:id
 * @description Borra a un bien asociado a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - Id del bien.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay bienes asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * DELETE /goods/john_doe/6818e84ab66205e8b1ed04f0
 */
APIgoods.delete("/goods/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "User not found",
      });
    } else {
      const good = await Good.findOneAndDelete({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});