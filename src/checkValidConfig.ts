import type { ConfigInterface } from "./config.types.js";

export const checkValidConfig = (
  config: object,
): config is Partial<ConfigInterface> => {
  const validInterface: Record<string, "string" | "boolean"> = {
    rootDir: "string",
    outDir: "string",
    worldcodeDir: "string",
    minify: "boolean",
  };
  const configEntries = Object.entries(config);
  for (const [key, value] of configEntries) {
    if (validInterface[key] == null) {
      console.error(`unexpected key: ${key}`);
      process.exit(1);
    }
    const validType = validInterface[key];
    const valueType = typeof value;
    if (valueType !== validType) {
      console.error(`unexpected value: ${value} in key: ${key}`);
      process.exit(1);
    }
  }
  return true;
};
