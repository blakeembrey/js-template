import { template } from "./index";

describe("string-template", () => {
  it("should accept data", () => {
    const fn = template("Hello {{name}}!");

    expect(fn({ name: "Blake" })).toEqual("Hello Blake!");
  });

  it("should support vars at beginning or end of template", () => {
    const fn = template("{{test}}");

    expect(fn({ test: "test" })).toEqual("test");
  });

  it("should escape quotes in compilation output", () => {
    const fn = template("\"Some things\" {{test}} 'quoted'");

    expect(fn({ test: "are" })).toEqual("\"Some things\" are 'quoted'");
  });
});
