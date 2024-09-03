import { describe, bench } from "vitest";
import { template } from "./index";

describe("template", () => {
  const fn = template("Hello {{name}}!");

  bench("exec", () => {
    fn({ name: "Blake" });
  });
});
