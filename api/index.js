require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const { sql } = require("@vercel/postgres");

const bodyParser = require("body-parser");
const path = require("path");

// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(express.json());
app.use(express.static("public"));

// для cors ========
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Разрешить только этот домен
//     methods: "GET,POST,PUT,DELETE",
//     allowedHeaders: "Content-Type",
//   })
// );
app.use(
  cors({
    origin: "https://frontend-plants.vercel.app/", // Разрешить только этот домен
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type",
  })
);
// =================

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "components", "home.html"));
});

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "components", "about.html"));
});

app.get("/uploadUser", function (req, res) {
  res.sendFile(
    path.join(__dirname, "..", "components", "user_upload_form.html")
  );
});
app.get("/addnew", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "components", "addplants.html"));
});

// получение всех список расение
app.get("/plants", async (req, res) => {
  try {
    const plants = await sql`SELECT * FROM plants;`;
    if (plants && plants.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: plants.rows });
    } else {
      res.status(404).json({ message: "Растение не существует" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});
// для добавление новый запис
// app.post("/plants", urlencodedParser, async (req, res) => {
//   try {
//     console.log(req.body);
//     await sql`INSERT INTO plants (name, latin_name, description) VALUES (${req.body.name}, ${req.body.latin_name}, ${req.body.description});`;
//     res.status(200).send("<h1>User added successfully</h1>");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error adding user");
//   }
// });
app.post("/addPlant", urlencodedParser, async (req, res) => {
  try {
    console.log(req.body);
    req.body.name = req.body.name.replace(/[\x00-\x1F\x7F]/g, "");
    req.body.latin_name = req.body.latin_name.replace(/[\x00-\x1F\x7F]/g, "");
    req.body.description = req.body.description.replace(/[\x00-\x1F\x7F]/g, "");
    req.body.habitat = req.body.habitat.replace(/[\x00-\x1F\x7F]/g, "");
    req.body.medicinal_uses = req.body.medicinal_uses.replace(
      /[\x00-\x1F\x7F]/g,
      ""
    );
    await sql`INSERT INTO plants  (name,latin_name, family_id,  description, habitat, medicinal_uses, image) VALUES (${
      req.body.name
    }, ${req.body.latin_name}, ${Number(req.body.family_id)}, ${
      req.body.description
    },  ${req.body.habitat} , ${req.body.medicinal_uses}, ${req.body.image});`;
    res.status(200).send(`
      <div>
        <h2>Растение ${req.body.name} успешно добавлена на БД.</h2>
        <a href='/addnew'>Вернутся на страница добавление</a>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавление");
  }
});

// добавление семейство
app.post("/addFamily", urlencodedParser, async (req, res) => {
  try {
    console.log(req.body);
    req.body.family_name = req.body.family_name.replace(/[\x00-\x1F\x7F]/g, "");
    req.body.family_description = req.body.family_description.replace(
      /[\x00-\x1F\x7F]/g,
      ""
    );
    await sql`INSERT INTO families  (name, description) VALUES (${req.body.family_name}, ${req.body.family_description});`;
    res.status(200).send(`
      <div>
        <h2>Семейство ${req.body.family_name} успешно добавлена на БД.</h2>
        <a href='/addnew'>Вернутся на страница добавление</a>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавление нового семейство");
  }
});

// список семейств families
app.get("/families", async (req, res) => {
  try {
    const families = await sql`SELECT * FROM families;`;
    if (families && families.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: families.rows });
    } else {
      res.status(404).json({ message: "families не существует" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});

// место произрастания
app.get("/locations", async (req, res) => {
  try {
    const region = await sql`SELECT * FROM locations;`;
    if (region && region.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: region.rows });
    } else {
      res.status(404).json({ message: "locations пустой" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});
// добавление место произрастение растения
app.post("/location", urlencodedParser, async (req, res) => {
  try {
    console.log(req.body);
    req.body.region = req.body.region.replace(/[\x00-\x1F\x7F]/g, "");
    req.body.location_description = req.body.location_description.replace(
      /[\x00-\x1F\x7F]/g,
      ""
    );

    await sql`INSERT INTO locations (region, description) VALUES (${req.body.region}, ${req.body.location_description});`;
    res.status(200).send(`
      <div>
        <h2>Место произрастение ${req.body.region} успешно добавлена на БД.</h2>
        <a href='/addnew'>Вернутся на страница добавление</a>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавление нового семейство");
  }
});

//  химическое соединение
app.get("/chem_comps", async (req, res) => {
  try {
    const chem_comp = await sql`SELECT * FROM chemical_compounds;`;
    if (chem_comp && chem_comp.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: chem_comp.rows });
    } else {
      res.status(404).json({ message: "chemical_compounds пустой" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});
// добавление химическое соединение
app.post("/chem_comp", urlencodedParser, async (req, res) => {
  try {
    console.log(req.body);
    req.body.chemical_name = req.body.chemical_name.replace(
      /[\x00-\x1F\x7F]/g,
      ""
    );
    req.body.chemical_description = req.body.chemical_description.replace(
      /[\x00-\x1F\x7F]/g,
      ""
    );

    await sql`INSERT INTO chemical_compounds (name, description) VALUES (${req.body.chemical_name}, ${req.body.chemical_description});`;
    res.status(200).send(`
      <div>
        <h2>Химическое соединение ${req.body.chemical_name} успешно добавлена на БД.</h2>
        <a href='/addnew'>Вернутся на страница добавление</a>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавление нового семейство");
  }
});

// Связать растение с местом произрастания
app.post("/plant_location", urlencodedParser, async (req, res) => {
  try {
    console.log(req.body);
    const { plant_id, location_id } = req.body;
    const rez = await sql`select plantlocation(${Number(plant_id)}, ${Number(
      location_id
    )});`;
    res.status(200).send(`
      <div>
        <h2>Связать растение ${plant_id} с местом произрастания ${location_id} ${rez.rows[0].plantlocation}.</h2>
        <a href='/addnew'>Вернутся на страница добавление</a>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавление нового семейство");
  }
});

// Связать растение с химическим соединением
app.post("/plant_chemical", urlencodedParser, async (req, res) => {
  try {
    console.log(req.body);
    const { plant_id, chemical_id } = req.body;

    const rez = await sql`select plantchemical(${Number(plant_id)}, ${Number(
      chemical_id
    )})`;

    console.log(rez.rows);

    res.status(200).send(`
      <div>
        <h2>Связать растение ${plant_id} с химическим соединением ${chemical_id} ${rez.rows[0].plantchemical}.</h2>
        <a href='/addnew'>Вернутся на страница добавление</a>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при добавление нового семейство");
  }
});

app.get("/getplant/:id", async (req, res) => {
  try {
    const plant = await sql`SELECT getplant(${Number(req.params.id)});`;
    console.log(plant.rows.length, plant.rows);

    if (plant && plant.rows.length > 0) {
      res.status(200).json(JSON.parse(plant.rows[0].getplant));
    } else {
      res.status(404).json({ message: "plant пустой" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
