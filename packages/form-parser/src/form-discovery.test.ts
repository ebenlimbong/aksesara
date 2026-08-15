// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { discoverForms } from "./form-discovery";
import { isExcludedField, generateCssSelector } from "./dom-utils";

describe("Form Discovery & Extraction", () => {
  it("should discover form fields from HTML container", () => {
    document.body.innerHTML = `
      <form id="beasiswa-form" action="/submit" method="POST">
        <input type="hidden" name="_csrf" value="12345" />
        <label for="nama">Nama Lengkap</label>
        <input type="text" id="nama" name="nama" required minlength="3" maxlength="100" />

        <label for="email">Alamat Email</label>
        <input type="email" id="email" name="email" required />

        <label for="penghasilan">Penghasilan Orang Tua</label>
        <input type="number" id="penghasilan" name="penghasilan" min="0" max="50000000" />

        <label for="prodi">Program Studi</label>
        <select id="prodi" name="prodi">
          <option value="IF">Informatika</option>
          <option value="EL">Teknik Elektro</option>
        </select>

        <label for="catatan">Catatan Tambahan</label>
        <textarea id="catatan" name="catatan"></textarea>

        <input type="submit" value="Kirim" />
      </form>
    `;

    const forms = discoverForms(document);
    expect(forms.length).toBe(1);

    const form = forms[0];
    expect(form.formId).toBe("beasiswa-form");
    expect(form.fields.length).toBe(5); // nama, email, penghasilan, prodi, catatan (hidden _csrf & submit excluded)

    const namaField = form.fields.find((f) => f.source.id === "nama");
    expect(namaField).toBeDefined();
    expect(namaField?.fieldType).toBe("text");
    expect(namaField?.constraints.required).toBe(true);
    expect(namaField?.constraints.minLength).toBe(3);
    expect(namaField?.constraints.maxLength).toBe(100);

    const selectField = form.fields.find((f) => f.source.id === "prodi");
    expect(selectField).toBeDefined();
    expect(selectField?.fieldType).toBe("select");
    expect(selectField?.options?.length).toBe(2);
  });

  it("should filter out excluded fields like CSRF tokens and disabled inputs", () => {
    const hiddenCsrf = document.createElement("input");
    hiddenCsrf.type = "hidden";
    hiddenCsrf.name = "_csrf";
    expect(isExcludedField(hiddenCsrf)).toBe(true);

    const disabledInput = document.createElement("input");
    disabledInput.disabled = true;
    expect(isExcludedField(disabledInput)).toBe(true);

    const submitBtn = document.createElement("input");
    submitBtn.type = "submit";
    expect(isExcludedField(submitBtn)).toBe(true);

    const normalInput = document.createElement("input");
    normalInput.type = "text";
    expect(isExcludedField(normalInput)).toBe(false);
  });

  it("should generate valid CSS selectors for elements", () => {
    document.body.innerHTML = `
      <form id="main-form">
        <input type="text" id="username" />
      </form>
    `;
    const input = document.getElementById("username")!;
    const selector = generateCssSelector(input);
    expect(selector).toBe("#username");
  });
});
