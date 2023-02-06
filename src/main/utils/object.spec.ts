import { describe, expect, it } from "@jest/globals";
import { mergeNonNullishValue, plainToClass } from "./object";

describe("plainToClass", () => {
  it("should transform", () => {
    class A {
      constructor(
        public id: number,
        public name: string,
        public b: B,
        public c: { b: B },
        public d: Record<string, B>,
        public e: E,
        public f: B[]
      ) {}
    }
    class B {
      constructor(public id: number, public name: string) {}
    }
    class E {
      constructor(public id: number, public e?: E) {}
    }
    const e: any = { key: "e", cls: E };
    e.args = ["id", e];
    const def = {
      cls: A,
      args: [
        "id",
        "name",
        // class property
        { key: "b", cls: B, args: ["id", "name"] },
        // object property having class property
        { key: "c", cls: Object, args: [{ key: "b", cls: B, args: ["id", "name"] }] },
        // record property
        { key: "d", cls: Object, args: [{ key: "", cls: B, args: ["id", "name"] }] },
        // recursive property
        e,
        // array property
        { key: "f", cls: B, args: ["id", "name"] },
      ],
    };

    const actual = plainToClass(def, {
      id: 1,
      name: "hello",
      b: { id: 2, name: "world" },
      c: { b: { id: 3, name: "!!" } },
      d: { foo: { id: 4, name: "foo" }, bar: { id: 5, name: "bar" } },
      e: { id: 1, e: { id: 2, e: { id: 3 } } },
      f: [
        { id: 6, name: "fizz" },
        { id: 7, name: "buzz" },
      ],
    });
    const expected = new A(
      1,
      "hello",
      new B(2, "world"),
      { b: new B(3, "!!") },
      { foo: new B(4, "foo"), bar: new B(5, "bar") },
      new E(1, new E(2, new E(3))),
      [new B(6, "fizz"), new B(7, "buzz")]
    );
    expect(actual).toStrictEqual(expected);
  });
});

describe("mergeNonNullishValue", () => {
  it("should merge non nullish value", () => {
    class A {
      constructor(public id: number, public name: string, public b: B) {}
    }
    class B {
      constructor(public id: number, public name: string) {}
    }
    const def = {
      cls: A,
      args: ["id", "name", { key: "b", cls: B, args: ["id", "name"] }],
    };
    const a = plainToClass(def, { id: 1, b: { id: 2, name: null } } as any);
    const b = plainToClass(def, { id: 3, name: "hello", b: { id: 4, name: "world" } });
    const merged = mergeNonNullishValue(b, a);
    const expected = new A(1, "hello", new B(2, "world"));
    expect(merged).toStrictEqual(expected);
  });
});
