import { describe, expect, it } from "@jest/globals";
import { mergeNonNullishValue, plainToClass } from "./object";

describe("plainToClass", () => {
  it("should transform sharrow object", () => {
    class A {
      constructor(public id: number, public name: string) {}
    }
    const def = {
      cls: A,
      args: ["id", "name"],
    };

    const actual = plainToClass(def, {
      id: 1,
      name: "hello",
    });
    const expected = new A(1, "hello");
    expect(actual).toStrictEqual(expected);
  });
  it("should transform nested class", () => {
    class A {
      constructor(public b: B) {}
    }
    class B {
      constructor(public id: number, public name: string) {}
    }
    const def = {
      cls: A,
      args: [{ key: "b", cls: B, args: ["id", "name"] }],
    };

    const actual = plainToClass(def, {
      b: { id: 2, name: "world" },
    });
    const expected = new A(new B(2, "world"));
    expect(actual).toStrictEqual(expected);
  });
  it("should transform object nested complicated objecct", () => {
    class A {
      constructor(public c: { b: B }) {}
    }
    class B {
      constructor(public id: number, public name: string) {}
    }
    const def = {
      cls: A,
      args: [{ key: "c", cls: Object, args: [{ key: "b", cls: B, args: ["id", "name"] }] }],
    };

    const actual = plainToClass(def, {
      c: { b: { id: 3, name: "!!" } },
    });
    const expected = new A({ b: new B(3, "!!") });
    expect(actual).toStrictEqual(expected);
  });
  it("should transform record", () => {
    class A {
      constructor(public d: Record<string, B>) {}
    }
    class B {
      constructor(public id: number, public name: string) {}
    }
    const def = {
      cls: A,
      args: [{ key: "d", cls: Object, args: [{ key: "", cls: B, args: ["id", "name"] }] }],
    };

    const actual = plainToClass(def, {
      d: { foo: { id: 4, name: "foo" }, bar: { id: 5, name: "bar" } },
    });
    const expected = new A({ foo: new B(4, "foo"), bar: new B(5, "bar") });
    expect(actual).toStrictEqual(expected);
  });
  it("should transform recursive object", () => {
    class A {
      constructor(public e: E) {}
    }
    class E {
      constructor(public id: number, public e?: E) {}
    }
    const e: any = { key: "e", cls: E };
    e.args = ["id", e];
    const def = {
      cls: A,
      args: [e],
    };

    const actual = plainToClass(def, {
      e: { id: 1, e: { id: 2, e: { id: 3 } } },
    });
    const expected = new A(new E(1, new E(2, new E(3))));
    expect(actual).toStrictEqual(expected);
  });
  it("should transform array", () => {
    class A {
      constructor(public f: B[]) {}
    }
    class B {
      constructor(public id: number, public name: string) {}
    }

    const def = {
      cls: A,
      args: [{ key: "f", cls: Array, args: [{ key: "", cls: B, args: ["id", "name"] }] }],
    };

    const actual = plainToClass(def, {
      f: [
        { id: 6, name: "fizz" },
        { id: 7, name: "buzz" },
      ],
    });
    const expected = new A([new B(6, "fizz"), new B(7, "buzz")]);
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
