// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { resolveFieldLabel, cleanLabelText } from "./label-resolver";

describe("Label Resolver & Text Cleaner", () => {
  it("should clean asterisks, required tags, and colons from label text", () => {
    expect(cleanLabelText("* Nama Lengkap (Wajib):")).toBe("Nama Lengkap");
    expect(cleanLabelText("Alamat Email * (Required)")).toBe("Alamat Email");
  });

  it("should resolve <label for> with 0.95 confidence score", () => {
    document.body.innerHTML = `
      <label for="username">Nama Pengguna *</label>
      <input type="text" id="username" name="username" />
    `;
    const input = document.getElementById("username")!;
    const res = resolveFieldLabel(input);

    expect(res.label).toBe("Nama Pengguna");
    expect(res.confidence).toBe(0.95);
    expect(res.evidence[0].source).toBe("label-for");
  });

  it("should resolve wrapping <label> with 0.90 confidence score", () => {
    document.body.innerHTML = `
      <label>
        Nomor Telepon:
        <input type="tel" id="phone" />
      </label>
    `;
    const input = document.getElementById("phone")!;
    const res = resolveFieldLabel(input);

    expect(res.label).toBe("Nomor Telepon");
    expect(res.confidence).toBe(0.9);
    expect(res.evidence[0].source).toBe("wrapping-label");
  });

  it("should resolve aria-label with 0.80 confidence score", () => {
    document.body.innerHTML = `
      <input type="text" id="search" aria-label="Cari Dokumen" />
    `;
    const input = document.getElementById("search")!;
    const res = resolveFieldLabel(input);

    expect(res.label).toBe("Cari Dokumen");
    expect(res.confidence).toBe(0.8);
    expect(res.evidence[0].source).toBe("aria-label");
  });

  it("should fallback to technical name with 0.30 confidence score", () => {
    document.body.innerHTML = `
      <input type="text" name="parent_income_amount" />
    `;
    const input = document.querySelector("input")!;
    const res = resolveFieldLabel(input);

    expect(res.label).toBe("Parent Income Amount");
    expect(res.confidence).toBe(0.3);
    expect(res.evidence[0].source).toBe("technical-name");
  });
});
