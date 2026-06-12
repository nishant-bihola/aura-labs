import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schema";

export default defineConfig({
  name: "default",
  title: "Aura Labs CMS",
  projectId: "y0p4aq65", // from user
  dataset: "production",
  basePath: "/studio",
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
