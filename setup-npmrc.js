import * as fs from "node:fs";
import process from "node:process";
import dotenv from "dotenv/config.js";

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error("Error: GITHUB_TOKEN is not set in the .env file.");
  process.exit(1);
}

const npmrcContent = `@agionoja:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${githubToken}
`;

fs.writeFileSync(".npmrc", npmrcContent);
console.log(".npmrc file successfully created.");
