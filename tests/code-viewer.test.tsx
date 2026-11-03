import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import CodeViewer from "../src/machine/CodeViewer";
import { MACHINE_PROBLEMS } from "../src/machine/problems";
import { getDemo } from "../src/machine/registry";

// Vitest stubs CSS imports by default; load the real stylesheet for cascade checks.
const styles = readFileSync("src/machine/machine.css", "utf8");

let stylesheet: HTMLStyleElement;
beforeEach(() => {
  stylesheet = document.createElement("style");
  stylesheet.textContent = styles;
  document.head.appendChild(stylesheet);
});
afterEach(() => { cleanup(); stylesheet.remove(); });

describe("complete implementation listings", () => {
  it.each(MACHINE_PROBLEMS.map(p => [p.id]))("displays every line of %s in vertically stacked rows", id => {
    const { source } = getDemo(id);
    render(<CodeViewer code={source} label="Implementation" />);
    const viewer = screen.getByLabelText("Implementation");
    const rows = [...viewer.querySelectorAll(".mc-source-line")];
    const sourceLines = source.split("\n");
    expect(rows.length).toBe(sourceLines.length);
    expect(rows.length).toBeGreaterThan(10);
    expect(rows.map(row => row.querySelector(".mc-source-text")?.textContent)).toEqual(sourceLines.map(line => line || " "));
    // Inline-flex siblings inside a <pre> previously became one horizontal row.
    for (const row of rows) expect(getComputedStyle(row).display).toBe("flex");
    expect(getComputedStyle(viewer.querySelector("code")!).display).toBe("block");
    expect(getComputedStyle(viewer.querySelector(".mc-source-text")!).whiteSpace).toBe("pre");
  });
  it("expands and restores the full listing height", () => {
    render(<CodeViewer code={getDemo("tabs").source} label="Implementation" />);
    const viewer = screen.getByLabelText("Implementation");
    expect(getComputedStyle(viewer).maxHeight).toBe("660px");
    fireEvent.click(screen.getByRole("button", { name: "Expand full code" }));
    expect(getComputedStyle(viewer).maxHeight).toBe("none");
    fireEvent.click(screen.getByRole("button", { name: "Limit code height" }));
    expect(getComputedStyle(viewer).maxHeight).toBe("660px");
  });
  it("uses the same multiline viewer for shared preview styles", () => {
    render(<CodeViewer code={styles} label="Preview CSS" />);
    expect(screen.getByLabelText("Preview CSS").querySelectorAll(".mc-source-line").length).toBe(styles.split("\n").length);
  });
});
