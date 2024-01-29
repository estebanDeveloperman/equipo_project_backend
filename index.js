import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Thekinghasarrived123@534",
  database: "crud_equipo",
});

app.use(express.json()); // Permite al servidor entender y procesar estos datos JSON adjuntos en el cuerpo de la solicitud.
app.use(cors());

app.get("/", (req, res) => {
  res.json("hello this is the backend!");
});

app.get("/equipos", (req, res) => {
  const q = "SELECT * FROM equipo";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/equipos", (req, res) => {
  const q =
    "INSERT INTO equipo (`nombre`,`marca`,`modelo`,`serie`,`etiqueta_patrimonial`,`ubicacion`,`otm`,`observaciones`) VALUES (?)";
  const values = [
    req.body.nombre,
    req.body.marca,
    req.body.modelo,
    req.body.serie,
    req.body.etiqueta_patrimonial,
    req.body.ubicacion,
    req.body.otm,
    req.body.observaciones,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json("Equipo has been created successfully.");
  });
});

app.delete("/equipos/:id", (req, res) => {
  const equipoId = req.params.id;
  const q = "DELETE FROM equipo WHERE id = ?";

  db.query(q, [equipoId], (err, data) => {
    if (err) return res.json(err);
    return res.json("Equipo has been deleted successfully.");
  });
});

app.put("/equipos/:id", (req, res) => {
  const equipoId = req.params.id;
  const q =
    "UPDATE equipo SET `nombre` = ?, `marca` = ?,`modelo` = ?,`serie` = ?,`etiqueta_patrimonial` = ?,`ubicacion` = ?,`otm` = ?,`observaciones` = ? WHERE id = ?";

  const values = [
    req.body.nombre,
    req.body.marca,
    req.body.modelo,
    req.body.serie,
    req.body.etiqueta_patrimonial,
    req.body.ubicacion,
    req.body.otm,
    req.body.observaciones,
  ];

  db.query(q, [...values, equipoId], (err, data) => {
    if (err) return res.json(err);
    return res.json("Equipo has been updated successfully.");
  });
});

app.listen(8800, () => {
  console.log("Connected to backend");
});
