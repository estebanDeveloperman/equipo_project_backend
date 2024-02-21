import express from "express";
import mysql from "mysql2";
import cors from "cors";
import { PORT } from "./config.js";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_PORT
} from "./config.js"

const app = express();

const db = mysql.createConnection({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
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
  // const values = [
  //   req.body.nombre,
  //   req.body.marca,
  //   req.body.modelo,
  //   req.body.serie,
  //   req.body.etiqueta_patrimonial,
  //   req.body.ubicacion,
  //   req.body.otm,
  //   req.body.observaciones,
  // ];
  const {
    nombre,
    marca,
    modelo,
    serie,
    etiqueta_patrimonial,
    ubicacion,
    otm,
    observaciones,
    fecha_mantenimiento, // Nuevo campo en el formulario
    descripcion_mantenimiento, // Nuevo campo en el formulario
  } = req.body;

  const qEquipo =
    "INSERT INTO equipo (`nombre`,`marca`,`modelo`,`serie`,`etiqueta_patrimonial`,`ubicacion`,`otm`,`observaciones`) VALUES (?)";
  const valuesEquipo = [
    nombre,
    marca,
    modelo,
    serie,
    etiqueta_patrimonial,
    ubicacion,
    otm,
    observaciones,
  ];

  db.query(qEquipo, [valuesEquipo], (errEquipo, dataEquipo) => {
    if (errEquipo) return res.json(errEquipo);

    // Si se proporciona fecha de mantenimiento, insertar en la tabla de mantenimiento_equipo
    if (fecha_mantenimiento) {
      const qMantenimiento =
        "INSERT INTO mantenimiento_equipo (id_equipo, fecha_mantenimiento, descripcion) VALUES (?, ?, ?)";
      const valuesMantenimiento = [
        dataEquipo.insertId,
        fecha_mantenimiento,
        descripcion_mantenimiento,
      ];

      db.query(
        qMantenimiento,
        valuesMantenimiento,
        (errMantenimiento, dataMantenimiento) => {
          if (errMantenimiento) return res.json(errMantenimiento);

          return res.json(
            "Equipo y Mantenimiento han sido creados exitosamente."
          );
        }
      );
    } else {
      return res.json("Equipo ha sido creado exitosamente.");
    }
  });

  // db.query(q, [values], (err, data) => {
  //   if (err) return res.json(err);
  //   return res.json("Equipo has been created successfully.");
  // });
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

  // Obtener la fecha de mantenimiento actual del equipo
  const qFechaMantenimientoActual =
    "SELECT fecha_mantenimiento FROM mantenimiento_equipo WHERE id_equipo = ?";
  db.query(
    qFechaMantenimientoActual,
    [equipoId],
    (errFechaMantenimiento, resultFechaMantenimiento) => {
      if (errFechaMantenimiento) return res.json(errFechaMantenimiento);

      const fechaMantenimientoActual = resultFechaMantenimiento[0]
        ? resultFechaMantenimiento[0].fecha_mantenimiento
        : null;
      const nuevaFechaMantenimiento = req.body.fecha_mantenimiento;

      // Actualizar el equipo
      const qActualizarEquipo =
        "UPDATE equipo SET `nombre` = ?, `marca` = ?,`modelo` = ?,`serie` = ?,`etiqueta_patrimonial` = ?,`ubicacion` = ?,`otm` = ?,`observaciones` = ? WHERE id = ?";
      const valuesActualizarEquipo = [
        req.body.nombre,
        req.body.marca,
        req.body.modelo,
        req.body.serie,
        req.body.etiqueta_patrimonial,
        req.body.ubicacion,
        req.body.otm,
        req.body.observaciones,
        equipoId,
      ];

      db.query(
        qActualizarEquipo,
        valuesActualizarEquipo,
        (errActualizarEquipo, dataActualizarEquipo) => {
          if (errActualizarEquipo) return res.json(errActualizarEquipo);

          // Verificar si la fecha de mantenimiento ha cambiado
          if (nuevaFechaMantenimiento && nuevaFechaMantenimiento !== fechaMantenimientoActual) {
            if (fechaMantenimientoActual) {
              // Si hay una fecha de mantenimiento existente, actualizar el registro existente
              const qActualizarMantenimiento =
                "UPDATE mantenimiento_equipo SET fecha_mantenimiento = ?, descripcion = ? WHERE id_equipo = ?";
              const valuesActualizarMantenimiento = [
                nuevaFechaMantenimiento,
                req.body.descripcion_mantenimiento,
                equipoId,
              ];

              db.query(
                qActualizarMantenimiento,
                valuesActualizarMantenimiento,
                (errActualizarMantenimiento) => {
                  if (errActualizarMantenimiento)
                    return res.json(errActualizarMantenimiento);
                  return res.json(
                    "Equipo y Mantenimiento han sido actualizados exitosamente."
                  );
                }
              );
            } else {
              // Si no hay una fecha de mantenimiento existente, crear un nuevo registro
              const qAgregarMantenimiento =
                "INSERT INTO mantenimiento_equipo (id_equipo, fecha_mantenimiento, descripcion) VALUES (?, ?, ?)";
              const valuesAgregarMantenimiento = [
                equipoId,
                nuevaFechaMantenimiento,
                req.body.descripcion_mantenimiento,
              ];

              db.query(
                qAgregarMantenimiento,
                valuesAgregarMantenimiento,
                (errAgregarMantenimiento) => {
                  if (errAgregarMantenimiento)
                    return res.json(errAgregarMantenimiento);
                  return res.json(
                    "Equipo y Mantenimiento han sido creados exitosamente."
                  );
                }
              );
            }
          } else {
            // Si la fecha de mantenimiento no ha cambiado, no es necesario realizar ninguna operación adicional
            return res.json("Equipo ha sido actualizado exitosamente.");
          }
          // Si la fecha de mantenimiento ha cambiado, agregar un nuevo registro en mantenimiento_equipo
          // if (nuevaFechaMantenimiento !== fechaMantenimientoActual) {
          //   const qAgregarMantenimiento =
          //     "INSERT INTO mantenimiento_equipo (id_equipo, fecha_mantenimiento, descripcion) VALUES (?, ?, ?)";
          //   const valuesAgregarMantenimiento = [
          //     equipoId,
          //     nuevaFechaMantenimiento,
          //     req.body.descripcion_mantenimiento,
          //   ];

          //   db.query(qAgregarMantenimiento, valuesAgregarMantenimiento, (errAgregarMantenimiento, dataAgregarMantenimiento) => {
          //     if (errAgregarMantenimiento) return res.json(errAgregarMantenimiento);

          //     return res.json("Equipo y Mantenimiento han sido actualizados exitosamente.");
          //   });
          // } else {
          //   return res.json("Equipo ha sido actualizado exitosamente.");
          // }
        }
      );
    }
  );
  // const q =
  //   "UPDATE equipo SET `nombre` = ?, `marca` = ?,`modelo` = ?,`serie` = ?,`etiqueta_patrimonial` = ?,`ubicacion` = ?,`otm` = ?,`observaciones` = ? WHERE id = ?";

  // const values = [
  //   req.body.nombre,
  //   req.body.marca,
  //   req.body.modelo,
  //   req.body.serie,
  //   req.body.etiqueta_patrimonial,
  //   req.body.ubicacion,
  //   req.body.otm,
  //   req.body.observaciones,
  // ];

  // db.query(q, [...values, equipoId], (err, data) => {
  //   if (err) return res.json(err);
  //   return res.json("Equipo has been updated successfully.");
  // });
});

app.get("/equipos/:id/mantenimiento", (req, res) => {
  const equipoId = req.params.id;
  const q =
    "SELECT * FROM mantenimiento_equipo WHERE id_equipo = ? ORDER BY fecha_mantenimiento DESC LIMIT 1";

  db.query(q, [equipoId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.listen(PORT, () => {
  console.log("Connected to backend");
});
