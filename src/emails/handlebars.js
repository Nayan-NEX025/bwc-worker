import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

/**
 * Register all partials recursively
 */
const registerPartials = (dir, baseDir) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      registerPartials(fullPath, baseDir);
    } else if (file.endsWith(".hbs")) {
      // ✅ SAFE relative path (cross-platform)
      const partialName = path
        .relative(baseDir, fullPath)
        .replace(/\\/g, "/") // Windows fix
        .replace(".hbs", "");

      const content = fs.readFileSync(fullPath, "utf8");
      Handlebars.registerPartial(partialName, content);
    }
  });
};

/**
 * Init handlebars
 */
export const initHandlebars = () => {
  const baseDir = path.join(process.cwd(), "src", "emails", "templates");

  registerPartials(baseDir, baseDir);
};

export default Handlebars;
