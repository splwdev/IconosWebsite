/**
 * Plain-text building blocks for enquiry emails: the same labelled list of
 * answers goes to Iconos and, as a copy, to the person who sent it.
 */

export interface EmailSection {
  heading: string;
  lines: { label: string; value: string }[];
  /** Free text shown under the heading as-is (e.g. the message). */
  text?: string;
}

/** e.g. "Wednesday 21 October 2026, 13:10 (UK time)". Built from parts, so it reads the same in every runtime. */
export function formatSubmittedAt(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} (UK time)`;
}

export function renderSections(sections: EmailSection[]): string {
  return sections
    .map((section) => {
      const lines = section.lines.map((l) => `${l.label}: ${l.value.trim() || "—"}`);
      return [section.heading.toUpperCase(), ...lines, ...(section.text ? [section.text] : [])].join("\n");
    })
    .join("\n\n");
}
