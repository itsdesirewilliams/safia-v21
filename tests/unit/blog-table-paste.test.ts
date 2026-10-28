import { describe, expect, it } from "vitest";

import { parsePastedTable } from "@/lib/blog/table-paste";

describe("pasted table parser", () => {
  it("parses an HTML table from Excel or a web page", () => {
    const rows = parsePastedTable({
      html: `
        <table>
          <tr><th>Size</th><th>Pattern</th></tr>
          <tr><td>295/80R22.5</td><td>FM-06</td></tr>
        </table>`,
      text: "",
    });

    expect(rows).toEqual([
      ["Size", "Pattern"],
      ["295/80R22.5", "FM-06"],
    ]);
  });

  it("parses a Google Sheets wrapper with inline formatting", () => {
    const rows = parsePastedTable({
      html: `<google-sheets-html-origin><table><tbody>
        <tr><td><b>1</b></td><td>Two</td></tr>
        <tr><td>Three<br>lines</td><td>&nbsp;</td></tr>
      </tbody></table></google-sheets-html-origin>`,
    });

    expect(rows).toEqual([
      ["1", "Two"],
      ["Three lines", ""],
    ]);
  });

  it("parses tab-separated text", () => {
    const rows = parsePastedTable({
      text: "Name\tRole\nSandeep\tDirector\nShubhika\tManager\n",
    });

    expect(rows).toEqual([
      ["Name", "Role"],
      ["Sandeep", "Director"],
      ["Shubhika", "Manager"],
    ]);
  });

  it("pads short rows to the widest row", () => {
    const rows = parsePastedTable({
      text: "A\tB\tC\n1\t2\n",
    });
    expect(rows).toEqual([
      ["A", "B", "C"],
      ["1", "2", ""],
    ]);
  });

  it("ignores ordinary text and single-column text", () => {
    expect(parsePastedTable({ text: "Just a paragraph." })).toBeNull();
    expect(parsePastedTable({ text: "one\ntwo\nthree" })).toBeNull();
    expect(parsePastedTable({ html: "<p>No table here</p>", text: "" })).toBeNull();
  });
});
