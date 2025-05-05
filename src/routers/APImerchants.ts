import express from 'express';
import { Merchant } from '../models/merchant.js';
import { User } from "../models/users.js";
export const APImerchant = express.Router();

/**
 * @route POST /merchants/:username
 * @description Crea un nuevo mercader asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.body.name - Nombre del mercader.
 * @param {string} req.body.race - Raza del mercader.
 * @param {string} req.body.location - Localización del mercader.
 * @param {string} req.body.type - Tipo o especialidad del mercader.
 *
 * @returns {201 Created} Mercader creado correctamente.
 * @returns {404 Not Found} Usuario no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.post("/merchants/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = new Merchant({
        ...req.body
      });

      await merchant.save();
      await merchant.populate({
        path: "owner",
        select: ["username"],
      });
      res.status(201).send(merchant);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants/:username
 * @description Obtiene todos los mercaderes asociados al nombre de usuario proporcionado.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 *
 * @returns {200 OK} Lista de mercaderes.
 * @returns {404 Not Found} Usuario no encontrado o sin mercaderes asociados.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.get("/merchants/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchants = await Merchant.find({
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchants.length !== 0) {
        res.send(merchants);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  };
});

/**
 * @route GET /merchants/:username/:id
 * @description Obtiene un mercader específico por su ID.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - ID del mercader.
 *
 * @returns {200 OK} Mercader encontrado.
 * @returns {404 Not Found} Usuario o mercader no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.get("/merchants/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

  if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants/:username/:name
 * @description Busca un mercader por su nombre.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.name - Nombre del mercader.
 *
 * @returns {200 OK} Mercader encontrado.
 * @returns {404 Not Found} Usuario o mercader no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.get("/merchants/:username/:name", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        _id: req.params.name,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchants/:username/:location
 * @description Busca un mercader por su localización.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.location - Localización del mercader.
 *
 * @returns {200 OK} Mercader encontrado.
 * @returns {404 Not Found} Usuario o mercader no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.get("/merchants/:username/:location", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        _id: req.params.location,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /merchants/:username/:type
 * @description Elimina un mercader por tipo/especialidad.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.type - Tipo del mercader.
 *
 * @returns {200 OK} Mercader eliminado.
 * @returns {404 Not Found} Usuario o mercader no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.delete("/merchants/:username/:type", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    })

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        _id: req.params.type,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /merchants/:username/:id
 * @description Actualiza los datos de un mercader por ID.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - ID del mercader a actualizar.
 * @param {string} req.body.name - Nuevo nombre del mercader.
 * @param {string} req.body.location - Nueva localización del mercader.
 * @param {string} req.body.breed - Nueva raza del mercader.
 *
 * @returns {200 OK} Mercader actualizado correctamente.
 * @returns {400 Bad Request} Campos inválidos para actualización.
 * @returns {404 Not Found} Usuario o mercader no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.patch("/merchants/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const allowedUpdates = ["name", "location", "breed"];
      const actualUpdates = Object.keys(req.body);
      const isValidUpdate = actualUpdates.every((update) =>
        allowedUpdates.includes(update),
      );

      if (!isValidUpdate) {
        res.status(400).send({
          error: "La actualización no está permitida",
        });
      } else {
        const merchant = await Merchant.findOneAndUpdate(
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

        if (merchant) {
          res.send(merchant);
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
 * @route DELETE /merchants/:username/:id
 * @description Elimina un mercader por ID.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - ID del mercader a eliminar.
 *
 * @returns {200 OK} Mercader eliminado correctamente.
 * @returns {404 Not Found} Usuario o mercader no encontrado.
 * @returns {500 Internal Server Error} Error interno del servidor.
 */
APImerchant.delete("/merchants/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOneAndDelete({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      }
      else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});