import { describe, it, expect } from "vitest";
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

  it("should handle backslashes", () => {
    const fn = template("test\\");

    expect(fn({})).toEqual("test");
  });

  it("should handle escaped characters", () => {
    const fn = template("foo\\bar");

    expect(fn({})).toEqual("foobar");
  });

  it("should allow nested reference", () => {
    const fn = template("{{foo.bar}}");

    expect(fn({ foo: { bar: "hello" } })).toEqual("hello");
  });

  it("should not access prototype properties", () => {
    const fn = template("{{toString}}");

    expect(() => fn({})).toThrow(TypeError);
  });
});
