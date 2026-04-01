import path from "node:path";
import fs from "node:fs";
import esbuild from "esbuild";
export const bundle = async (config) => {
    const { rootDir: inputRootDir, outDir: outputDir, worldcodeDir: configWorldcodeDir, codeblockDir: configCodeblockDir, minify, } = config;
    const rootDir = process.cwd();
    const outputPath = path.resolve(rootDir, outputDir);
    const tempDir = path.resolve(outputPath, ".temp");
    const srcPath = path.resolve(rootDir, inputRootDir);
    // copy to temp
    fs.cpSync(srcPath, tempDir, { recursive: true });
    // worldcode
    const worldcodePath = path.resolve(tempDir, configWorldcodeDir);
    const allWorldcodeFiles = fs
        .readdirSync(worldcodePath)
        .filter((name) => name.endsWith(".js"))
        .map((name) => "./" + name);
    const worldcodeImportText = allWorldcodeFiles
        .map((name) => `import "${name}";`)
        .join("\n");
    const worldcodeOutputPath = path.resolve(outputPath, "worldcode.js");
    await esbuild.build({
        stdin: {
            contents: worldcodeImportText,
            resolveDir: worldcodePath,
            sourcefile: "all-worldcode-import.js",
        },
        bundle: true,
        outfile: worldcodeOutputPath,
        platform: "neutral",
        format: "iife",
        target: "esnext",
        minify,
    });
    // codeblock
    const codeblockPath = path.resolve(tempDir, configCodeblockDir);
    const allCodeBlockFilePath = fs
        .readdirSync(codeblockPath)
        .filter((filename) => filename.endsWith("js"))
        .map((filename) => path.join(codeblockPath, filename));
    await esbuild.build({
        entryPoints: allCodeBlockFilePath,
        bundle: true,
        outdir: outputPath,
        minify,
        platform: "neutral",
        format: "iife",
        target: "esnext",
    });
    fs.rmSync(tempDir, { recursive: true, force: true });
};
