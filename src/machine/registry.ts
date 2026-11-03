import type { ComponentType } from "react";

// The reference code and the live demo come from the same file.
const components = import.meta.glob<{ default: ComponentType }>("./demos/*.tsx", { eager: true });
const sources = import.meta.glob<string>("./demos/*.tsx", { eager: true, query: "?raw", import: "default" });

export function getDemo(id: string) {
  const path = `./demos/${id}.tsx`;
  return { Component: components[path]?.default, source: sources[path] ?? "" };
}
