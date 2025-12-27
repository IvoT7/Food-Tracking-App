const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());

const mealsRoute = require("./routes/meals");
app.use("/meals", mealsRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));