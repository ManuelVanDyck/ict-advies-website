import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "mgu8mw2o",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});
