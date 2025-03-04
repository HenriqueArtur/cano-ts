import path from "node:path";
import { FactoryRollupConfigsObject } from "./rollup-obj.ts";

const dist = path.join("..", "..", "./dist");

export default FactoryRollupConfigsObject(dist);
