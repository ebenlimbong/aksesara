import { describe, it, expect } from "vitest";
import { createEmptyFormGraph } from "./index";

describe("Form Parser Placeholder", () => {
  it("should create empty form graph", () => {
    const fg = createEmptyFormGraph("https://example.id", "Test Form");
    expect(fg.origin).toBe("https://example.id");
    expect(fg.title).toBe("Test Form");
    expect(fg.nodes).toEqual([]);
  });
});
