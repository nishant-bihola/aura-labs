import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "y0p4aq65",
  dataset: "production",
  useCdn: false, // set to false if you want fresh data always
  apiVersion: "2024-01-01",
});

