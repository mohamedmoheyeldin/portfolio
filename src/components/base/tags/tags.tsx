// Adapted from Untitled UI's MIT-licensed tags component. Status-only variants.
import type { ReactNode } from "react";
import { Tag as AriaTag, TagGroup as AriaTagGroup, TagList as AriaTagList } from "react-aria-components";
import { Dot } from "@/components/foundations/dot-icon";

export function TagGroup({ label, children }: { label: string; children: ReactNode }) {
  return <AriaTagGroup aria-label={label} selectionMode="none">{children}</AriaTagGroup>;
}

export const TagList = AriaTagList;

export function Tag({ id, children, available = false }: { id: string; children: string; available?: boolean }) {
  return (
    <AriaTag id={id} textValue={children} className="flex cursor-default items-center gap-1.25 rounded-md bg-primary px-2.25 py-0.5 text-sm font-medium text-secondary ring-1 ring-primary ring-inset outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
      <Dot size="sm" aria-hidden="true" className={available ? "text-fg-success-secondary" : "text-fg-quaternary"} />
      {children}
    </AriaTag>
  );
}
