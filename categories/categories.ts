import { api } from "encore.dev/api";

// Defines a public Encore API endpoint named `list` using the `GET` method at the path `/categories`.
// The endpoint returns a JSON response containing a hardcoded array of category strings.
export const list = api({ method: "GET", path: "/categories", auth: false }, async () => {
  return {
    categories: ["Food", "Transport", "Shopping", "Utilities", "Health", "Entertainment"],
  };
});