import fs from "fs";
import path from "path";
import Handlebars, { initHandlebars } from "../../emails/handlebars.js";
import { APP_NAME, EMAIL_FROM } from "../../configs/env.js";
import resend from "../../configs/resend.config.js";

initHandlebars();

export const sendEmail = async ({ to, subject, template, payload }) => {
  let templatePath;

  // 🔀 Decide template location
  if (template === "campaign") {
    templatePath = path.join(
      process.cwd(),
      "src",
      "emails",
      "templates",
      "campaign.hbs",
    );
  } else {
    // transactional / auth emails
    templatePath = path.join(
      process.cwd(),
      "src",
      "emails",
      "templates",
      "auth",
      `${template}.hbs`,
    );
  }

  const source = fs.readFileSync(templatePath, "utf8");
  const compiledTemplate = Handlebars.compile(source);
  const html = compiledTemplate({
    ...payload,
    year: new Date().getFullYear(),
    appName: APP_NAME,
  });

  const { data, error } = await resend.emails.send({
    from: `${APP_NAME} <${EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
  // resend response: {data: null, error: {status: 403, name, message}}
  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }
  return data;
};
