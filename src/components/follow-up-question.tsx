"use client";

import type { FollowUpQuestion } from "@/lib/contact/enquiry";
import { SelectChevron, fieldClass, labelClass } from "./form-fields";

/** One follow-up question: a dropdown, a set of tick boxes, or a short text answer. */
export function FollowUp({
  question,
  value,
  onChange,
}: {
  question: FollowUpQuestion;
  value: string | string[] | undefined;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const id = `q-${question.id}`;
  const span = question.width === "half" ? "" : "sm:col-span-2";

  if (question.type === "text") {
    return (
      <div className={span}>
        <label htmlFor={id} className={labelClass}>
          {question.label}
        </label>
        <input
          id={id}
          maxLength={500}
          className={`${fieldClass} border-transparent`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      </div>
    );
  }

  if (question.type === "checkboxes") {
    const checked = Array.isArray(value) ? value : [];
    return (
      <fieldset className={span}>
        <legend className={labelClass}>
          {question.label} <span className="font-normal text-brand-dark/60">(tick any)</span>
        </legend>
        <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          {question.options.map((option) => (
            <label key={option} className="flex items-center gap-2.5 text-sm text-brand-dark">
              <input
                type="checkbox"
                className="h-4 w-4 flex-shrink-0 rounded border-neutral-400"
                checked={checked.includes(option)}
                onChange={(e) =>
                  onChange(
                    question.id,
                    e.target.checked ? [...checked, option] : checked.filter((c) => c !== option)
                  )
                }
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={span}>
      <label htmlFor={id} className={labelClass}>
        {question.label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`${fieldClass} appearance-none border-transparent pr-10`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(question.id, e.target.value)}
        >
          <option value="">Please select</option>
          {question.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}
