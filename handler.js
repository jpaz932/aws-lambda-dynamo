const express = require("express");
const serverless = require("serverless-http");

const routes = require('./routes/hero.router');

const app = express();

app.use(express.json());

app.use(routes);

module.exports.handler = serverless(app);
