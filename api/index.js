require("dotenv").config();

const express = require("express");
const app = express();
const { sql } = require("@vercel/postgres");

const bodyParser = require("body-parser");
const path = require("path");

// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static("public"));

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

app.post("/uploadSuccessful", urlencodedParser, async (req, res) => {
  try {
    await sql`CREATE TABLE plants(id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    latin_name VARCHAR NOT NULL,
    description TEXT NOT NULL
)`;
    res.status(200).send("<h1>User added successfully</h1>");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user");
  }
});

app.get("/allUsers", async (req, res) => {
  try {
    const users = await sql`SELECT * FROM plants;`;
    if (users && users.rows.length > 0) {
      let tableContent = users.rows
        .map(
          (plant) =>
            `<tr>
                        <td>${plant.id}</td>
                        <td>${plant.name}</td>
                        <td>${plant.latin_name}</td>
                        <td>${plant.description}</td>
                    </tr>`
        )
        .join("");

      res.status(200).send(`
                <html>
                    <head>
                        <title>Users</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 15px;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: left;
                            }
                            th {
                                background-color: #f2f2f2;
                            }
                            a {
                                text-decoration: none;
                                color: #0a16f7;
                                margin: 15px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Users</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableContent}
                            </tbody>
                        </table>
                        <div>
                            <a href="/">Home</a>
                            <a href="/uploadUser">Add User</a>
                        </div>
                    </body>
                </html>
            `);
    } else {
      res.status(404).send("Users not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users");
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
