import express from 'express';
import { User } from '../models/users.js';
import { Merchant } from '../models/merchant.js';

export const APIuser = express.Router();

APIuser.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

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

// cambiar de query a ruta indirecta /users/:username
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