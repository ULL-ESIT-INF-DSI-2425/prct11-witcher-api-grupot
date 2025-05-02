import express from 'express';
import { Good } from '../models/goods.js';
import { User } from "../models/users.js";
export const APIgoods = express.Router();

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