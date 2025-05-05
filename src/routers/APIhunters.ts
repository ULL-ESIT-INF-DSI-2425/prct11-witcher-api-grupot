import express from 'express';
import { Hunter } from '../models/hunters.js';
import { User } from "../models/users.js";
export const APIhunter = express.Router();

/**
 * @route POST /hunters/:username
 * @description Crea un cazador asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {number} req.body.name - Nombre del cazador (requerido).
 * @param {string} req.body.race - Raza del cazador (requerido; Options: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead').
 * @param {string} [req.body.location] - Localización del cazador (requerido).
 *
 * @returns {201 Created} Hunter creado o actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {401 Unauthorized} Token de autenticación no proporcionado o inválido.
 *
 * @example
 * POST /hunters/john_doe
 * {
 *   "name": Geralt,
 *   "race": "Human",
 *   "location": "Astera"
 * }
 */
APIhunter.post("/hunters/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = new Hunter({
        ...req.body,
        owner: user._id,
      });

      await hunter.save();
      await hunter.populate({
        path: "owner",
        select: ["username"],
      });
      res.status(201).send(hunter);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/:username
 * @description Obtiene todos los cazadores registrados asociados a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay cazadores asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * GET /hunters/john_doe
 */
APIhunter.get("/hunters/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunters = await Hunter.find({
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunters.length !== 0) {
        res.send(hunters);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/:username/:id
 * @description Obtiene un cazador registrado asociado a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - Id asociado al cazador que se quiere consultar.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay cazadores asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * GET /hunters/john_doe/6818e84ab66205e8b1ed04f0
 */
APIhunter.get("/hunters/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/:username/:name
 * @description Obtiene un cazador registrado asociado a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.name - Nombre del cazador a consultar.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay cazadores asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * GET /hunters/john_doe/Geralt
 */
APIhunter.get("/hunters/:username/:name", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.name,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/:username/:location
 * @description Obtiene los cazadores registrados asociados a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.location - localización de los cazadoreas a consultar.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay cazadores asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * GET /hunters/john_doe/Astera
 */
APIhunter.get("/hunters/:username/:location", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.location,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunters/:username/:race
 * @description Obtiene los cazadores registrados asociados a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.race - Raza de los cazadoreas a consultar.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay cazadores asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * GET /hunters/john_doe/Astera
 */
APIhunter.get("/hunters/:username/:race", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.race,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /hunters/:username/:id
 * @description actualiza un cazador asociado al nombre de usuario proporcionado.
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {number} req.body.name - Nombre del cazador.
 * @param {string} req.body.race - Raza del cazador (Options: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead').
 * @param {string} req.body.location - Localización del cazador.
 *
 * @returns {201 Created} Hunter creado o actualizado correctamente.
 * @returns {400 Bad Request} Faltan campos requeridos en el cuerpo de la petición.
 * @returns {401 Unauthorized} Token de autenticación no proporcionado o inválido.
 *
 * @example
 * POST /hunters/john_doe/6818e84ab66205e8b1ed04f0
 * {
 *   "name": Geralt,
 *   "race": ~~"Human"~~ "Vampire",
 *   "location": "Astera"
 * }
 */
APIhunter.patch("/hunters/:username/:id", async (req, res) => {
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
        const hunter = await Hunter.findOneAndUpdate(
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

        if (hunter) {
          res.send(hunter);
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
 * @route DELETE /hunters/:username/:id
 * @description Borra a un cazador asociado a un usuario
 *
 * @param {string} req.params.username - Nombre de usuario asociado.
 * @param {string} req.params.id - Id del cazador.
 *
 * @returns {404 Bad Request} El usuario no se ha encontrado | No hay cazadores asociados al usuario.
 * @returns {500 Unauthorized} Error del servidor.
 *
 * @example
 * DELETE /hunters/john_doe/6818e84ab66205e8b1ed04f0
 */
APIhunter.delete("/hunters/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "User not found",
      });
    } else {
      const hunter = await Hunter.findOneAndDelete({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});