import express from 'express';
import { Merchant } from '../models/merchant.js';
import { User } from "../models/users.js";
export const APImerchant = express.Router();

// Crear un nuevo mercader
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

// Obtener todos los mercaderes
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

// Obtener un mercader por ID
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

// Obtener un mercader por nombre
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

// Buscar un mercader por location
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

// Buscar un mercader por especialidad/tipo
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

// Actualizar un mercader por ID
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