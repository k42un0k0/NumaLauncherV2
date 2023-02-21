import { describe, it } from "@jest/globals";
import { forEachOfLimit } from "./util";

jest.mock("electron");
describe("forEachLimit", () => {
  it("wait all task", async () => {
    let total = 0;
    await forEachOfLimit([...Array.from({ length: 101 }).keys()], 10, (item) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          total += item;
          resolve();
        }, Math.random());
      });
    });
    expect(total).toBe(5050);
  });
});
