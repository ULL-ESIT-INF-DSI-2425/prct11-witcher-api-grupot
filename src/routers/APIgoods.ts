import express from 'express';
import { Good } from '../models/goods.js';
import { User } from "../models/users.js";
export const APIgoods = express.Router();

/**
 * Método post para añadir bienes a la base de datos
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
 * Método Get para obtener todos los bienes almacenados en la 
 * base de datos
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
 * Método Get que permite obtener un bien específico mediante su
 * id (asignado por parte de la base de datos)
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
 * Método Get que permite obtener un bien específico mediante su nombre
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
 * Método Get que permite obtener los objetos almacenados mediante
 * su categoría asignada 
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
 * Método Get que permite obtener los bienes por un 
 * determinado material
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
 * Método Patch que utiliza el id del objeto para actualizar sus parametros
 * (id asignado automaticamente por la base de datos)
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
 * Método Delete que permite eliminar un bien mediante su 
 * id de base de datos 
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