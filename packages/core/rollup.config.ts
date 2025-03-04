import path from "node:path";
import { FactoryRollupConfigsObject } from "./rollup-obj.js";

const dist = path.join("..", "..", "./dist");

export default FactoryRollupConfigsObject(dist);
