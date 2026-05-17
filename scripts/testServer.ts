import path from "path";
import express, { Application } from "express";
import history from "connect-history-api-fallback";
import { frontendPort } from "../src/utils/portUtils";

const setupProxy = require("../src/setupProxy") as (app: Application) => void;

const app = express();

setupProxy(app);

app.use(history() as any);
app.use(express.static(path.join(__dirname, "../build")));

app.listen(frontendPort);
