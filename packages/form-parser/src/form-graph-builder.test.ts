// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { discoverForms } from "./form-discovery";
import { buildFormGraph } from "./form-graph-builder";
import { FormGraphSchema } from "@aksesara/form-schema";

describe("FormGraph Builder", () => {
  it("should build a valid FormGraph from discovered forms and pass Zod validation", () => {
    document.body.innerHTML = `
      <form id="pendaftaran-keringanan">
        <fieldset id="section-pribadi">
          <legend>Data Pribadi Mahasiswa</legend>
          <label for="nim">NIM *</label>
          <input type="text" id="nim" name="nim" required />
          <label for="nama">Nama Lengkap *</label>
          <input type="text" id="nama" name="nama" required />
        </fieldset>

        <fieldset id="section-ortu">
          <legend>Data Orang Tua</legend>
          <label for="nama_ayah">Nama Ayah</label>
          <input type="text" id="nama_ayah" name="nama_ayah" />
        </fieldset>
      </form>
    `;

    const forms = discoverForms(document);
    expect(forms.length).toBe(1);

    const graph = buildFormGraph(forms[0], "https://akademik.univ.ac.id", "Pendaftaran Keringanan UKT");

    expect(graph.origin).toBe("https://akademik.univ.ac.id");
    expect(graph.title).toBe("Pendaftaran Keringanan UKT");
    expect(graph.sections.length).toBe(2);
    expect(graph.nodes.length).toBe(3);

    // Verify Zod validation passes without error
    const validated = FormGraphSchema.safeParse(graph);
    expect(validated.success).toBe(true);
  });
});
