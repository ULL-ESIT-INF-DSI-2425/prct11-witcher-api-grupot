import { Hunter } from '../models/hunters.js';
import { Request, Response } from 'express';

/**
 * Método que permite obtener todos los cazadores de la base de datos
 */
export const getAllHunters = async (req: Request, res: Response) => {
  try {
    const filters = req.query;

    const hunters = Object.keys(filters).length === 0
      ? await Hunter.find()
      : await Hunter.find(filters);

    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({
        error: Object.keys(filters).length === 0
          ? "No hay cazadores registrados"
          : "No se encontraron cazadores con esos filtros"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

/**
 * Método que permite obetener los cazadores mediante Id
 */
export const getHunterById = async (req: Request, res: Response) => {
  try {
    const hunter = await Hunter.findOne({ _id: req.params.id });
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({ error: "No se encontró el cazador" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

/**
 * Método que permite obetener los cazadores mediante su nombre
 */
export const getHunterByName = async (req: Request, res: Response) => {
  try {
    const hunter = await Hunter.findOne({ name: req.params.name });
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({ error: "No se encontró el cazador" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

/**
 * Método que permite obetener los cazadores mediante su localización
 */
export const getHuntersByLocation = async (req: Request, res: Response) => {
  try {
    const hunters = await Hunter.find({ location: req.params.location });
    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({
        error: "No se encontraron cazadores en esa localización"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

/**
 * Método que permite obetener los cazadores mediante su raza
 */
export const getHuntersByRace = async (req: Request, res: Response) => {
  try {
    const hunters = await Hunter.find({ race: req.params.race });
    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({
        error: "No se encontraron cazadores de esa raza"
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};