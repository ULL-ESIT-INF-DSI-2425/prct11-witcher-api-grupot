import express, { Request, Response, Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MerchantManager } from "./merchantsManager.js";
import { Merchant } from "./models/merchant";


dotenv.config();


const app: Express = express();
const manager = new CustomerManager();


app.use(express.json());


// Conectar a MongoDB Atlas
const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority";


mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Connection error", err));




// Crear mercader
app.post("/merchants", async (req: Request, res: Response) => {
  try {
    const merchant = new Merchant(req.body);
    const saved = await merchant.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Leer mercader por ID
app.get("/merchants/:id", async (req: Request, res: Response) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).send("Merchant not found");
    res.json(merchant);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Leer mercader por nombre
app.get("/merchants", async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).send("Name query required");


    const merchant = await Merchant.findOne({ name: String(name) });
    if (!merchant) return res.status(404).send("Merchant not found");
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Actualizar mercader por ID
app.put("/merchants/:id", async (req: Request, res: Response) => {
  try {
    const merchant = await Merchant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!merchant) return res.status(404).send("Merchant not found");
    res.json(merchant);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Actualizar mercader por nombre
app.put("/merchants", async (req: Request, res: Response) => {
  try {
    const { name, ...updateData } = req.body;
    if (!name) return res.status(400).send("Name required in body");


    const merchant = await Merchant.findOneAndUpdate({ name }, updateData, {
      new: true,
      runValidators: true,
    });
    if (!merchant) return res.status(404).send("Merchant not found");
    res.json(merchant);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Borrar mercader por ID
app.delete("/merchants/:id", async (req: Request, res: Response) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);
    if (!merchant) return res.status(404).send("Merchant not found");
    res.send("Merchant deleted");
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Borrar mercader por nombre
app.delete("/merchants", async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).send("Name query required");


    const merchant = await Merchant.findOneAndDelete({ name: String(name) });
    if (!merchant) return res.status(404).send("Merchant not found");
    res.send("Merchant deleted");
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

