import express from 'express';
import { User } from '../models/users.js';
import { Merchant } from '../models/merchant.js';

export const APIuser = express.Router();

/**
 * @route POST /users
 * @description Crea un nuevo usuario con los datos proporcionados.
 *
 * @param {string} req.body.name - Nombre del usuario (requerido).
 * @param {string} req.body.username - Nombre de usuario único (requerido).
 * @param {number} req.body.age - Edad del usuario (opcional).
 *
 * @returns {201 Created} Usuario creado correctamente.
 * @returns {500 Internal Server Error} Error al guardar el usuario.
 *
 * @example
 * POST /users
 * {
 *   "name": "Juan Pérez",
 *   "username": "juanp",
 *   "age": 30
 * }
 */
APIuser.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /users
 * @description Obtiene todos los usuarios o filtra por nombre de usuario si se proporciona en la query.
 *
 * @param {string} [req.query.username] - Nombre de usuario a buscar (opcional).
 *
 * @returns {200 OK} Lista de usuarios encontrados.
 * @returns {404 Not Found} No se encontraron usuarios con ese nombre.
 * @returns {500 Internal Server Error} Error durante la consulta.
 *
 * @example
 * GET /users?username=juanp
 */
APIuser.get("/users", async (req, res) => {
  const filter = req.query.username
    ? { username: req.query.username.toString() }
    : {};

  try {
    const users = await User.find(filter);

    if (users.length !== 0) {
      res.send(users);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /users
 * @description Actualiza los datos de un usuario según el nombre de usuario proporcionado en la query.
 *
 * @param {string} req.query.username - Nombre de usuario a actualizar (requerido).
 * @param {string} [req.body.name] - Nuevo nombre del usuario.
 * @param {string} [req.body.username] - Nuevo nombre de usuario.
 * @param {number} [req.body.age] - Nueva edad del usuario.
 *
 * @returns {200 OK} Usuario actualizado correctamente.
 * @returns {400 Bad Request} Campos no permitidos o falta de parámetros.
 * @returns {404 Not Found} Usuario no encontrado.
 * @returns {500 Internal Server Error} Error al actualizar el usuario.
 *
 * @example
 * PATCH /users?username=juanp
 * {
 *   "age": 31
 * }
 */
APIuser.patch("/users", async (req, res) => {
  if (!req.query.username) {
    res.status(400).send({
      error: "Es necesario el nombre de usuario",
    });
  } else {
    const allowedUpdates = ["name", "username", "age"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida",
      });
    } else {
      try {
        const user = await User.findOneAndUpdate(
          {
            username: req.query.username.toString(),
          },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );

        if (user) {
          res.send(user);
        } else {
          res.status(404).send();
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

/**
 * @route DELETE /users
 * @description Elimina un usuario y todos los mercaderes asociados según el nombre de usuario proporcionado en la query.
 *
 * @param {string} req.query.username - Nombre de usuario a eliminar (requerido).
 *
 * @returns {200 OK} Usuario y mercaderes eliminados correctamente.
 * @returns {400 Bad Request} Falta el parámetro de nombre de usuario.
 * @returns {404 Not Found} Usuario no encontrado.
 * @returns {500 Internal Server Error} Error al eliminar el usuario o sus mercaderes.
 *
 * @example
 * DELETE /users?username=juanp
 */
APIuser.delete("/users", async (req, res) => {
  if (!req.query.username) {
    res.status(400).send({
      error: "Es necesario el nombre de usuario",
    });
  } else {
    try {
      const user = await User.findOne({
        username: req.query.username.toString(),
      });

      if (!user) {
        res.status(404).send();
      } else {
        const result = await Merchant.deleteMany({ owner: user._id });

        if (!result.acknowledged) {
          res.status(500).send();
        } else {
          await User.findByIdAndDelete(user._id);
          res.send(user);
        }
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});