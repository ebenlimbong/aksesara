import { describe, it, expect } from "vitest";
import { FormGraphSchema } from "./form-graph";

describe("FormGraph Schema Validation", () => {
  it("should validate a valid FormGraph object", () => {
    const validFormGraph = {
      id: "form_123",
      origin: "https://example.com",
      title: "Formulir Pendaftaran",
      mode: "universal",
      sections: [
        {
          sectionId: "sec_1",
          title: "Data Diri",
          nodeIds: ["node_1"]
        }
      ],
      nodes: [
        {
          nodeId: "node_1",
          source: {
            xpath: "//input[@id='nama']",
            cssSelector: "#nama",
            tagName: "INPUT",
            type: "text"
          },
          fieldType: "text",
          officialLabel: "Nama Lengkap",
          required: true,
          constraints: {
            required: true
          },
          sensitivity: "normal",
          confidence: 0.95,
          evidence: [
            {
              source: "label-for",
              score: 0.95,
              text: "Nama Lengkap"
            }
          ],
          supported: true
        }
      ]
    };

    const parsed = FormGraphSchema.safeParse(validFormGraph);
    expect(parsed.success).toBe(true);
  });
});
