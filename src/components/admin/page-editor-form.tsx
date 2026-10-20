"use client";
 
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Page } from "@/lib/content/pages";
import {
  getPagePublicPath,
  isSingletonPage,
  pageInputSchema,
  slugify,
  type PageInput,
} from "@/lib/content/pages";
import {
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  SECTION_BACKGROUNDS,
  HOME_ONLY_SECTION_TYPES,
  MEDIA_TYPES,
  MEDIA_SIZES,
  MEDIA_LAYOUTS,
  CTA_STYLES,
  FEATURE_STYLES,
  CARD_GRID_COLUMNS,
  createBlankSection,
  type PageSection,
  type SectionType,
  type TextSectionContent,
  type MediaSectionContent,
  type MediaTextSectionContent,
  type CtaSectionContent,
  type TiersSectionContent,
  type ServicesGridSectionContent,
  type ProgramsHighlightSectionContent,
  type TestimonialsSectionContent,
  type BlogTeaserSectionContent,
  type HeroSectionContent,
  type HeroCard,
  type IssuesSectionContent,
  type FeaturesSectionContent,
  type StepsSectionContent,
  type TextChecklistSectionContent,
  type ComparisonSectionContent,
  type TestimonialSpotlightSectionContent,
  type CalloutSectionContent,
  type TierCard,
} from "@/lib/content/page-sections";
import { isValidYouTubeUrl } from "@/lib/content/youtube";
import { generateMetaDescription } from "@/lib/content/generate-meta-description";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  savePage,
  saveSections,
  deletePage,
  uploadPageImage,
} from "@/app/admin/(protected)/pages/actions";
 
const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
 
const TYPE_LABEL: Record<Page["page_type"], string> = {
  service: "Service",
  program: "Program",
  custom: "Custom page",
  home: "Homepage",
  overview: "Section overview",
};
 
const MEDIA_SIZE_LABEL: Record<(typeof MEDIA_SIZES)[number], string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};
 
// A stable client-only id purely for React keys / drag-and-drop identity —
// never persisted. Saving does a full replace of the section list (see
// saveSections/replace_page_sections), so the database never tracks
// individual section ids across saves either — nothing to keep in sync.
type EditableSection = PageSection & { _localId: string };
 
function withLocalId(section: PageSection): EditableSection {
  return { ...section, _localId: crypto.randomUUID() };
}
 
function EyebrowField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-600">
        Eyebrow <span className="font-normal text-neutral-400">(small label above the heading, optional)</span>
      </label>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
 
// ---------------------------------------------------------------------------
// Per-type field components
// ---------------------------------------------------------------------------
 
function TextSectionFields({
  content,
  onChange,
}: {
  content: TextSectionContent;
  onChange: (content: TextSectionContent) => void;
}) {
  return (
    <div className="space-y-3">
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <RichTextEditor
        content={content.body}
        onChange={(html) => onChange({ ...content, body: html })}
      />
    </div>
  );
}
 
/**
 * Shared image/video picker used inside both MediaSectionFields and
 * MediaTextSectionFields — same media_type toggle, same conditional
 * image-upload-vs-YouTube-URL input, since both section content shapes
 * carry the identical media_type/image_url/video_url trio.
 */
function MediaPicker<T extends { media_type: "image" | "video"; image_url: string | null; image_alt: string; video_url: string }>({
  content,
  onChange,
  uploading,
  onImageFile,
}: {
  content: T;
  onChange: (content: T) => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
}) {
  const showUrlError = content.video_url.length > 0 && !isValidYouTubeUrl(content.video_url);
 
  return (
    <div>
      <div className="mb-2 flex gap-2">
        {MEDIA_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...content, media_type: type })}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              content.media_type === type
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600"
            }`}
          >
            {type === "image" ? "Image" : "Video"}
          </button>
        ))}
      </div>
 
      {content.media_type === "image" ? (
        <div>
          {content.image_url ? (
            <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border border-neutral-200">
              <Image
                src={content.image_url}
                alt={content.image_alt}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="mb-2 flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
              No image
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageFile(file);
            }}
            className="text-xs"
          />
          {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading…</p>}
          {content.image_url && (
            <input
              className={`${inputClass} mt-2`}
              placeholder="Alt text (describe the image for screen readers)"
              value={content.image_alt}
              onChange={(e) => onChange({ ...content, image_alt: e.target.value })}
            />
          )}
        </div>
      ) : (
        <div>
          <input
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v=..."
            value={content.video_url}
            onChange={(e) => onChange({ ...content, video_url: e.target.value })}
          />
          {showUrlError && (
            <p className="mt-1 text-xs text-red-600">
              Doesn&apos;t look like a valid YouTube URL — check it and try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
 
function MediaSectionFields({
  content,
  onChange,
  uploading,
  onImageFile,
}: {
  content: MediaSectionContent;
  onChange: (content: MediaSectionContent) => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
}) {
  return (
    <div className="space-y-4">
      <MediaPicker content={content} onChange={onChange} uploading={uploading} onImageFile={onImageFile} />
 
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Size</label>
        <div className="flex gap-2">
          {MEDIA_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ ...content, size })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                content.size === size
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {MEDIA_SIZE_LABEL[size]}
            </button>
          ))}
        </div>
      </div>
 
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Caption <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          className={inputClass}
          value={content.caption}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
        />
      </div>
    </div>
  );
}
 
function MediaTextSectionFields({
  content,
  onChange,
  uploading,
  onImageFile,
}: {
  content: MediaTextSectionContent;
  onChange: (content: MediaTextSectionContent) => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
}) {
  return (
    <div className="space-y-4">
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MediaPicker content={content} onChange={onChange} uploading={uploading} onImageFile={onImageFile} />
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Position</label>
          <div className="flex gap-2">
            {MEDIA_LAYOUTS.map((layout) => (
              <button
                key={layout}
                type="button"
                onClick={() => onChange({ ...content, layout })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  content.layout === layout
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                {layout === "media-left" ? "Media left" : "Media right"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <RichTextEditor
        content={content.body}
        onChange={(html) => onChange({ ...content, body: html })}
      />
      <LinkFields
        label={content.button_label}
        href={content.button_href}
        placeholder="/who-we-are"
        onLabelChange={(button_label) => onChange({ ...content, button_label })}
        onHrefChange={(button_href) => onChange({ ...content, button_href })}
      />
    </div>
  );
}
 
function CtaSectionFields({
  content,
  onChange,
}: {
  content: CtaSectionContent;
  onChange: (content: CtaSectionContent) => void;
}) {
  return (
    <div className="space-y-4">
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
 
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Style</label>
        <div className="flex gap-2">
          {CTA_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChange({ ...content, style })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${
                content.style === style
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
 
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Heading</label>
          <input
            className={inputClass}
            value={content.heading}
            onChange={(e) => onChange({ ...content, heading: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Body text (optional)
          </label>
          <textarea
            rows={2}
            className={inputClass}
            value={content.body}
            onChange={(e) => onChange({ ...content, body: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Button label</label>
          <input
            className={inputClass}
            value={content.button_label}
            onChange={(e) => onChange({ ...content, button_label: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Button link</label>
          <input
            className={inputClass}
            placeholder="/contact"
            value={content.button_href}
            onChange={(e) => onChange({ ...content, button_href: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Secondary button label <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            className={inputClass}
            value={content.secondary_button_label}
            onChange={(e) => onChange({ ...content, secondary_button_label: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Secondary button link
          </label>
          <input
            className={inputClass}
            placeholder="/how-we-work"
            value={content.secondary_button_href}
            onChange={(e) => onChange({ ...content, secondary_button_href: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
 
const BLANK_TIER: TierCard = {
  name: "",
  description: "",
  price: "",
  price_note: "",
  features_intro: "",
  features: [],
  button_label: "",
  button_href: "",
};

function TiersSectionFields({
  content,
  onChange,
}: {
  content: TiersSectionContent;
  onChange: (content: TiersSectionContent) => void;
}) {
  function updateTier(index: number, tier: TierCard) {
    onChange({ ...content, tiers: content.tiers.map((t, i) => (i === index ? tier : t)) });
  }
  function moveTier(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= content.tiers.length) return;
    onChange({ ...content, tiers: arrayMove(content.tiers, index, target) });
  }

  return (
    <div className="space-y-4">
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <Field label="Heading" hint="optional">
        <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
      </Field>
      <div className="space-y-3">
        {content.tiers.map((tier, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-neutral-200 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-500">Tier {index + 1}</span>
              <span className="flex gap-3">
                <button type="button" onClick={() => moveTier(index, -1)} className="text-neutral-500" aria-label={`Move tier ${index + 1} up`}>↑</button>
                <button type="button" onClick={() => moveTier(index, 1)} className="text-neutral-500" aria-label={`Move tier ${index + 1} down`}>↓</button>
                <button
                  type="button"
                  onClick={() => onChange({ ...content, tiers: content.tiers.filter((_, i) => i !== index) })}
                  className="font-medium text-red-600"
                >
                  Remove
                </button>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} value={tier.name} onChange={(e) => updateTier(index, { ...tier, name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Price" hint="e.g. £450">
                  <input className={inputClass} value={tier.price} onChange={(e) => updateTier(index, { ...tier, price: e.target.value })} />
                </Field>
                <Field label="After price" hint="e.g. + VAT a month">
                  <input className={inputClass} value={tier.price_note} onChange={(e) => updateTier(index, { ...tier, price_note: e.target.value })} />
                </Field>
              </div>
            </div>
            <Field label="Description">
              <textarea rows={2} className={inputClass} value={tier.description} onChange={(e) => updateTier(index, { ...tier, description: e.target.value })} />
            </Field>
            <Field label="Included — intro line" hint="optional, e.g. Everything in Essential, plus:">
              <input className={inputClass} value={tier.features_intro} onChange={(e) => updateTier(index, { ...tier, features_intro: e.target.value })} />
            </Field>
            <LinesField label="What's included" value={tier.features} onChange={(features) => updateTier(index, { ...tier, features })} rows={4} />
            <LinkFields
              label={tier.button_label}
              href={tier.button_href}
              onLabelChange={(button_label) => updateTier(index, { ...tier, button_label })}
              onHrefChange={(button_href) => updateTier(index, { ...tier, button_href })}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...content, tiers: [...content.tiers, { ...BLANK_TIER }] })}
        className="text-xs font-medium text-neutral-600 underline"
      >
        + Add tier
      </button>
    </div>
  );
}
 
// The four "smart" section types share the same minimal shape (eyebrow +
// heading), except services_grid which also has an intro paragraph — one
// generic fields component covers all four, with intro shown only when
// the caller passes it.
function SmartSectionFields<T extends { eyebrow: string; heading: string }>({
  content,
  onChange,
  intro,
}: {
  content: T;
  onChange: (content: T) => void;
  intro?: { value: string; onChange: (value: string) => void };
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-400">
        This section renders live content automatically — only the label text below is editable
        here.
      </p>
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Heading <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          className={inputClass}
          value={content.heading}
          onChange={(e) => onChange({ ...content, heading: e.target.value })}
        />
      </div>
      {intro && (
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Intro text <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            rows={2}
            className={inputClass}
            value={intro.value}
            onChange={(e) => intro.onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
 

// ---------------------------------------------------------------------------
// Homepage redesign section fields (hero, issues, features)
// ---------------------------------------------------------------------------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label} {hint && <span className="font-normal text-neutral-400">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

/** Edits a string[] as one item per line — simplest UI for non-technical editors. */
function LinesField({
  label,
  hint = "one per line",
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        className={inputClass}
        value={value.join("\n")}
        // Keep blank lines while typing; they're dropped on render and save.
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    </Field>
  );
}

function ImageUploadField({
  imageUrl,
  imageAlt,
  uploading,
  onImageFile,
  onAltChange,
  onRemove,
}: {
  imageUrl: string | null;
  imageAlt: string;
  uploading: boolean;
  onImageFile: (file: File) => void;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-neutral-600">Image</span>
      {imageUrl ? (
        <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border border-neutral-200">
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="mb-2 flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
          No image — the brand circle placeholder is shown
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageFile(file);
        }}
        className="text-xs"
      />
      {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading…</p>}
      {imageUrl && (
        <div className="mt-2 flex gap-2">
          <input
            className={inputClass}
            placeholder="Alt text — leave empty if the image is purely decorative"
            value={imageAlt}
            onChange={(e) => onAltChange(e.target.value)}
          />
          <button type="button" onClick={onRemove} className="text-xs font-medium text-red-600">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function LinkFields({
  label,
  href,
  onLabelChange,
  onHrefChange,
  placeholder = "/contact",
}: {
  label: string;
  href: string;
  onLabelChange: (value: string) => void;
  onHrefChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Button label" hint="optional">
        <input className={inputClass} value={label} onChange={(e) => onLabelChange(e.target.value)} />
      </Field>
      <Field label="Button link">
        <input
          className={inputClass}
          placeholder={placeholder}
          value={href}
          onChange={(e) => onHrefChange(e.target.value)}
        />
      </Field>
    </div>
  );
}

const BLANK_HERO_CARD: HeroCard = {
  eyebrow: "",
  title: "",
  summary: "",
  points: [],
  button_label: "Learn more",
  button_href: "",
  wide: false,
};

function HeroSectionFields({
  content,
  onChange,
  uploading,
  onImageFile,
}: {
  content: HeroSectionContent;
  onChange: (content: HeroSectionContent) => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
}) {
  function updateCard(index: number, card: HeroCard) {
    onChange({ ...content, cards: content.cards.map((c, i) => (i === index ? card : c)) });
  }
  function moveCard(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= content.cards.length) return;
    onChange({ ...content, cards: arrayMove(content.cards, index, target) });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <Field label="Heading" hint="the page's main H1">
            <textarea
              rows={2}
              className={inputClass}
              value={content.heading}
              onChange={(e) => onChange({ ...content, heading: e.target.value })}
            />
          </Field>
          <Field label="Intro text" hint="optional">
            <textarea
              rows={3}
              className={inputClass}
              value={content.lead}
              onChange={(e) => onChange({ ...content, lead: e.target.value })}
            />
          </Field>
        </div>
        <ImageUploadField
          imageUrl={content.image_url}
          imageAlt={content.image_alt}
          uploading={uploading}
          onImageFile={onImageFile}
          onAltChange={(image_alt) => onChange({ ...content, image_alt })}
          onRemove={() => onChange({ ...content, image_url: null, image_alt: "" })}
        />
      </div>

      <div>
        <span className="mb-2 block text-xs font-medium text-neutral-600">Service cards</span>
        <div className="space-y-3">
          {content.cards.map((card, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-neutral-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-500">Card {index + 1}</span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-neutral-600">
                    <input
                      type="checkbox"
                      checked={card.wide}
                      onChange={(e) => updateCard(index, { ...card, wide: e.target.checked })}
                    />
                    Full width
                  </label>
                  <button type="button" onClick={() => moveCard(index, -1)} className="text-neutral-500" aria-label={`Move card ${index + 1} up`}>
                    ↑
                  </button>
                  <button type="button" onClick={() => moveCard(index, 1)} className="text-neutral-500" aria-label={`Move card ${index + 1} down`}>
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...content, cards: content.cards.filter((_, i) => i !== index) })}
                    className="font-medium text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Label" hint="e.g. Subscription">
                  <input className={inputClass} value={card.eyebrow} onChange={(e) => updateCard(index, { ...card, eyebrow: e.target.value })} />
                </Field>
                <Field label="Title">
                  <input className={inputClass} value={card.title} onChange={(e) => updateCard(index, { ...card, title: e.target.value })} />
                </Field>
              </div>
              <Field label="Summary" hint="optional">
                <textarea rows={2} className={inputClass} value={card.summary} onChange={(e) => updateCard(index, { ...card, summary: e.target.value })} />
              </Field>
              <LinesField label="Bullet points" value={card.points} onChange={(points) => updateCard(index, { ...card, points })} rows={2} />
              <LinkFields
                label={card.button_label}
                href={card.button_href}
                placeholder="/how-we-work/subscription-model"
                onLabelChange={(button_label) => updateCard(index, { ...card, button_label })}
                onHrefChange={(button_href) => updateCard(index, { ...card, button_href })}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...content, cards: [...content.cards, { ...BLANK_HERO_CARD }] })}
          className="mt-2 text-xs font-medium text-neutral-600 underline"
        >
          + Add card
        </button>
      </div>

      <div className="space-y-3 rounded-lg bg-neutral-50 p-3">
        <Field label="Footnote" hint="optional, centred under the cards">
          <input className={inputClass} value={content.footnote} onChange={(e) => onChange({ ...content, footnote: e.target.value })} />
        </Field>
        <LinkFields
          label={content.footnote_link_label}
          href={content.footnote_link_href}
          placeholder="/how-we-work/ad-hoc-work"
          onLabelChange={(footnote_link_label) => onChange({ ...content, footnote_link_label })}
          onHrefChange={(footnote_link_href) => onChange({ ...content, footnote_link_href })}
        />
      </div>
    </div>
  );
}

function IssuesSectionFields({
  content,
  onChange,
  uploading,
  onImageFile,
}: {
  content: IssuesSectionContent;
  onChange: (content: IssuesSectionContent) => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
          <Field label="Heading">
            <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
          </Field>
        </div>
        <ImageUploadField
          imageUrl={content.image_url}
          imageAlt={content.image_alt}
          uploading={uploading}
          onImageFile={onImageFile}
          onAltChange={(image_alt) => onChange({ ...content, image_alt })}
          onRemove={() => onChange({ ...content, image_url: null, image_alt: "" })}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <LinesField label="Dark chips" hint="one per line — e.g. contract issues" value={content.primary_items} onChange={(primary_items) => onChange({ ...content, primary_items })} />
        <LinesField label="Light chips" hint="one per line — e.g. data protection issues" value={content.secondary_items} onChange={(secondary_items) => onChange({ ...content, secondary_items })} />
      </div>
      <Field label="Tagline" hint="optional, bold line under the chips">
        <input className={inputClass} value={content.tagline} onChange={(e) => onChange({ ...content, tagline: e.target.value })} />
      </Field>
      <LinkFields
        label={content.button_label}
        href={content.button_href}
        onLabelChange={(button_label) => onChange({ ...content, button_label })}
        onHrefChange={(button_href) => onChange({ ...content, button_href })}
      />
    </div>
  );
}

function FeaturesSectionFields({
  content,
  onChange,
}: {
  content: FeaturesSectionContent;
  onChange: (content: FeaturesSectionContent) => void;
}) {
  function updateItem(index: number, field: "title" | "body", value: string) {
    onChange({ ...content, items: content.items.map((it, i) => (i === index ? { ...it, [field]: value } : it)) });
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1 block text-xs font-medium text-neutral-600">Style</span>
        <div className="flex gap-2">
          {FEATURE_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChange({ ...content, style })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${
                content.style === style
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <Field label="Heading">
        <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
      </Field>
      <Field label="Intro text" hint="optional">
        <input className={inputClass} value={content.intro} onChange={(e) => onChange({ ...content, intro: e.target.value })} />
      </Field>
      <div className="space-y-2">
        <span className="block text-xs font-medium text-neutral-600">Columns <span className="font-normal text-neutral-400">(four fit best)</span></span>
        {content.items.map((item, index) => (
          <div key={index} className="flex gap-2 rounded-lg border border-neutral-200 p-3">
            <div className="flex-1 space-y-2">
              <input className={inputClass} placeholder="Title" value={item.title} onChange={(e) => updateItem(index, "title", e.target.value)} />
              <textarea rows={2} className={inputClass} placeholder="Short description" value={item.body} onChange={(e) => updateItem(index, "body", e.target.value)} />
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...content, items: content.items.filter((_, i) => i !== index) })}
              className="self-start text-xs font-medium text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, items: [...content.items, { title: "", body: "" }] })}
          className="text-xs font-medium text-neutral-600 underline"
        >
          + Add column
        </button>
      </div>
    </div>
  );
}

function StepsSectionFields({
  content,
  onChange,
}: {
  content: StepsSectionContent;
  onChange: (content: StepsSectionContent) => void;
}) {
  function updateItem(index: number, field: "title" | "body", value: string) {
    onChange({ ...content, items: content.items.map((it, i) => (i === index ? { ...it, [field]: value } : it)) });
  }
  function moveItem(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= content.items.length) return;
    onChange({ ...content, items: arrayMove(content.items, index, target) });
  }

  return (
    <div className="space-y-4">
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <Field label="Heading">
        <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
      </Field>
      <Field label="Intro text" hint="optional">
        <input className={inputClass} value={content.intro} onChange={(e) => onChange({ ...content, intro: e.target.value })} />
      </Field>
      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={content.numbered}
            onChange={(e) => onChange({ ...content, numbered: e.target.checked })}
          />
          Numbered (01, 02… — for a process)
        </label>
        <span className="flex items-center gap-1.5">
          Columns on desktop:
          {CARD_GRID_COLUMNS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...content, columns: n })}
              className={`rounded border px-2 py-0.5 font-medium ${
                content.columns === n ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"
              }`}
            >
              {n}
            </button>
          ))}
        </span>
      </div>
      <div className="space-y-2">
        <span className="block text-xs font-medium text-neutral-600">Cards</span>
        {content.items.map((item, index) => (
          <div key={index} className="flex gap-2 rounded-lg border border-neutral-200 p-3">
            <span className="w-6 pt-2 text-xs font-medium tabular-nums text-neutral-400">
              {content.numbered ? String(index + 1).padStart(2, "0") : "•"}
            </span>
            <div className="flex-1 space-y-2">
              <input className={inputClass} placeholder="Card title" value={item.title} onChange={(e) => updateItem(index, "title", e.target.value)} />
              <textarea rows={2} className={inputClass} placeholder="Short description" value={item.body} onChange={(e) => updateItem(index, "body", e.target.value)} />
            </div>
            <div className="flex flex-col items-end gap-1 text-xs">
              <button type="button" onClick={() => moveItem(index, -1)} className="text-neutral-500" aria-label={`Move step ${index + 1} up`}>↑</button>
              <button type="button" onClick={() => moveItem(index, 1)} className="text-neutral-500" aria-label={`Move step ${index + 1} down`}>↓</button>
              <button
                type="button"
                onClick={() => onChange({ ...content, items: content.items.filter((_, i) => i !== index) })}
                className="font-medium text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, items: [...content.items, { title: "", body: "" }] })}
          className="text-xs font-medium text-neutral-600 underline"
        >
          + Add card
        </button>
      </div>
      <div className="space-y-2 rounded-lg bg-neutral-900 p-3 text-white">
        <span className="block text-xs font-semibold text-neutral-300">
          Highlighted final card <span className="font-normal text-neutral-400">(optional — dark card at the end, e.g. &ldquo;Need help with something else?&rdquo;)</span>
        </span>
        <input
          className={`${inputClass} text-neutral-900`}
          placeholder="Title"
          value={content.final_card.title}
          onChange={(e) => onChange({ ...content, final_card: { ...content.final_card, title: e.target.value } })}
        />
        <textarea
          rows={2}
          className={`${inputClass} text-neutral-900`}
          placeholder="Short text"
          value={content.final_card.body}
          onChange={(e) => onChange({ ...content, final_card: { ...content.final_card, body: e.target.value } })}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={`${inputClass} text-neutral-900`}
            placeholder="Link label, e.g. Get in touch"
            value={content.final_card.link_label}
            onChange={(e) => onChange({ ...content, final_card: { ...content.final_card, link_label: e.target.value } })}
          />
          <input
            className={`${inputClass} text-neutral-900`}
            placeholder="/contact"
            value={content.final_card.link_href}
            onChange={(e) => onChange({ ...content, final_card: { ...content.final_card, link_href: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );
}

export type TestimonialOption = { id: string; label: string; published: boolean };

function TextChecklistSectionFields({
  content,
  onChange,
}: {
  content: TextChecklistSectionContent;
  onChange: (content: TextChecklistSectionContent) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_2fr]">
      <Field label="Text" hint="a blank line starts a new paragraph">
        <textarea
          rows={5}
          className={inputClass}
          value={content.body}
          onChange={(e) => onChange({ ...content, body: e.target.value })}
        />
      </Field>
      <div className="space-y-3">
        <Field label="Checklist label" hint="e.g. Ideal if">
          <input
            className={inputClass}
            value={content.list_label}
            onChange={(e) => onChange({ ...content, list_label: e.target.value })}
          />
        </Field>
        <LinesField label="Checklist items" value={content.items} onChange={(items) => onChange({ ...content, items })} />
      </div>
    </div>
  );
}

function ComparisonSectionFields({
  content,
  onChange,
}: {
  content: ComparisonSectionContent;
  onChange: (content: ComparisonSectionContent) => void;
}) {
  return (
    <div className="space-y-4">
      <EyebrowField value={content.eyebrow} onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <Field label="Heading">
        <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["left", "right"] as const).map((side) => (
          <div key={side} className={`space-y-3 rounded-lg p-3 ${side === "right" ? "bg-neutral-900 text-white" : "bg-neutral-50"}`}>
            <span className={`block text-xs font-semibold ${side === "right" ? "text-neutral-300" : "text-neutral-500"}`}>
              {side === "left" ? "Left column (the alternative)" : "Right column (highlighted — your offer)"}
            </span>
            <input
              className={`${inputClass} text-neutral-900`}
              placeholder="Column title"
              value={content[side].title}
              onChange={(e) => onChange({ ...content, [side]: { ...content[side], title: e.target.value } })}
            />
            <textarea
              rows={4}
              className={`${inputClass} text-neutral-900`}
              placeholder="One point per line"
              value={content[side].items.join("\n")}
              onChange={(e) =>
                onChange({ ...content, [side]: { ...content[side], items: e.target.value.split("\n") } })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialSpotlightSectionFields({
  content,
  onChange,
  testimonialOptions,
}: {
  content: TestimonialSpotlightSectionContent;
  onChange: (content: TestimonialSpotlightSectionContent) => void;
  testimonialOptions: TestimonialOption[];
}) {
  const selected = testimonialOptions.find((t) => t.id === content.testimonial_id);
  return (
    <div className="space-y-4">
      <Field label="Testimonial" hint="managed in Testimonials">
        <select
          className={inputClass}
          value={content.testimonial_id ?? ""}
          onChange={(e) => onChange({ ...content, testimonial_id: e.target.value || null })}
        >
          <option value="">None — button only</option>
          {testimonialOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
              {t.published ? "" : " (draft — won't show until published)"}
            </option>
          ))}
        </select>
      </Field>
      {content.testimonial_id && !selected && (
        <p className="text-xs text-amber-700">The selected testimonial no longer exists — choose another.</p>
      )}
      {!content.testimonial_id && (
        <Field label="Placeholder" hint="optional — shown in a dashed box until a testimonial is chosen">
          <input
            className={inputClass}
            placeholder="e.g. [Client testimonial, to follow]"
            value={content.placeholder_text}
            onChange={(e) => onChange({ ...content, placeholder_text: e.target.value })}
          />
        </Field>
      )}
      <Field label="Heading beside the testimonial" hint="optional, e.g. Need legal support regularly?">
        <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
      </Field>
      <Field label="Text beside the testimonial" hint="optional, shown above the button">
        <textarea rows={2} className={inputClass} value={content.text} onChange={(e) => onChange({ ...content, text: e.target.value })} />
      </Field>
      <LinkFields
        label={content.button_label}
        href={content.button_href}
        placeholder="/contact"
        onLabelChange={(button_label) => onChange({ ...content, button_label })}
        onHrefChange={(button_href) => onChange({ ...content, button_href })}
      />
    </div>
  );
}

function CalloutSectionFields({
  content,
  onChange,
}: {
  content: CalloutSectionContent;
  onChange: (content: CalloutSectionContent) => void;
}) {
  function updateBox(index: number, box: CalloutSectionContent["boxes"][number]) {
    onChange({ ...content, boxes: content.boxes.map((b, i) => (i === index ? box : b)) });
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Badge" hint="optional, e.g. No subscription needed">
          <input className={inputClass} value={content.badge} onChange={(e) => onChange({ ...content, badge: e.target.value })} />
        </Field>
        <Field label="Link anchor" hint="optional — lets other pages link to #this-name">
          <input
            className={inputClass}
            placeholder="data-protection-training"
            value={content.anchor}
            onChange={(e) => onChange({ ...content, anchor: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Heading">
        <input className={inputClass} value={content.heading} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
      </Field>
      <Field label="Text">
        <textarea rows={3} className={inputClass} value={content.body} onChange={(e) => onChange({ ...content, body: e.target.value })} />
      </Field>
      <Field label="Small print" hint="optional, smaller text under the main text">
        <input className={inputClass} value={content.note} onChange={(e) => onChange({ ...content, note: e.target.value })} />
      </Field>
      <LinkFields
        label={content.button_label}
        href={content.button_href}
        onLabelChange={(button_label) => onChange({ ...content, button_label })}
        onHrefChange={(button_href) => onChange({ ...content, button_href })}
      />
      <div className="space-y-2">
        <span className="block text-xs font-medium text-neutral-600">
          Side boxes <span className="font-normal text-neutral-400">(each can have a checklist, a paragraph, or both)</span>
        </span>
        {content.boxes.map((box, index) => (
          <div key={index} className="space-y-2 rounded-lg bg-neutral-50 p-3">
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Box label, e.g. Pricing"
                value={box.label}
                onChange={(e) => updateBox(index, { ...box, label: e.target.value })}
              />
              <button
                type="button"
                onClick={() => onChange({ ...content, boxes: content.boxes.filter((_, i) => i !== index) })}
                className="text-xs font-medium text-red-600"
              >
                Remove
              </button>
            </div>
            <textarea
              rows={3}
              className={inputClass}
              placeholder="Checklist — one item per line"
              value={box.items.join("\n")}
              onChange={(e) => updateBox(index, { ...box, items: e.target.value.split("\n") })}
            />
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Paragraph"
              value={box.text}
              onChange={(e) => updateBox(index, { ...box, text: e.target.value })}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, boxes: [...content.boxes, { label: "", items: [], text: "" }] })}
          className="text-xs font-medium text-neutral-600 underline"
        >
          + Add side box
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable card wrapper
// ---------------------------------------------------------------------------
 
function SortableSectionCard({
  id,
  children,
}: {
  id: string;
  children: (dragHandleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
 
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-neutral-200 bg-white p-4"
    >
      {children({ attributes, listeners })}
    </div>
  );
}
 
function SectionCard({
  section,
  onChange,
  onRemove,
  uploading,
  onImageFile,
  dragHandleProps,
  testimonialOptions,
}: {
  section: EditableSection;
  onChange: (section: PageSection) => void;
  onRemove: () => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
  testimonialOptions: TestimonialOption[];
  dragHandleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  };
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
            {SECTION_TYPE_LABELS[section.section_type]}
          </span>
          {section.section_type !== "cta" && (
            <div className="flex gap-1">
              {SECTION_BACKGROUNDS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => onChange({ ...section, background: bg } as PageSection)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    section.background === bg
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {bg === "tint" ? "Tinted" : "Plain"}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
 
      {section.section_type === "text" && (
        <TextSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "media" && (
        <MediaSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
          uploading={uploading}
          onImageFile={onImageFile}
        />
      )}
      {section.section_type === "media_text" && (
        <MediaTextSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
          uploading={uploading}
          onImageFile={onImageFile}
        />
      )}
      {section.section_type === "cta" && (
        <CtaSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "tiers" && (
        <TiersSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "services_grid" && (
        <SmartSectionFields<ServicesGridSectionContent>
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
          intro={{
            value: section.content.intro,
            onChange: (intro) =>
              onChange({ ...section, content: { ...section.content, intro } } as PageSection),
          }}
        />
      )}
      {section.section_type === "programs_highlight" && (
        <SmartSectionFields<ProgramsHighlightSectionContent>
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "testimonials" && (
        <div className="space-y-3">
          <SmartSectionFields<TestimonialsSectionContent>
            content={section.content}
            onChange={(content) => onChange({ ...section, content } as PageSection)}
          />
          <LinkFields
            label={section.content.button_label}
            href={section.content.button_href}
            placeholder="/clients"
            onLabelChange={(button_label) =>
              onChange({ ...section, content: { ...section.content, button_label } } as PageSection)
            }
            onHrefChange={(button_href) =>
              onChange({ ...section, content: { ...section.content, button_href } } as PageSection)
            }
          />
        </div>
      )}
      {section.section_type === "hero" && (
        <HeroSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
          uploading={uploading}
          onImageFile={onImageFile}
        />
      )}
      {section.section_type === "issues" && (
        <IssuesSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
          uploading={uploading}
          onImageFile={onImageFile}
        />
      )}
      {section.section_type === "features" && (
        <FeaturesSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "steps" && (
        <StepsSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "text_checklist" && (
        <TextChecklistSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "comparison" && (
        <ComparisonSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "callout" && (
        <CalloutSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
      {section.section_type === "testimonial_spotlight" && (
        <TestimonialSpotlightSectionFields
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
          testimonialOptions={testimonialOptions}
        />
      )}
      {section.section_type === "blog_teaser" && (
        <SmartSectionFields<BlogTeaserSectionContent>
          content={section.content}
          onChange={(content) => onChange({ ...section, content } as PageSection)}
        />
      )}
    </div>
  );
}
 
// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------
 
export function PageEditorForm({
  page,
  initialSections,
  testimonialOptions = [],
}: {
  page: Page;
  initialSections: PageSection[];
  testimonialOptions?: TestimonialOption[];
}) {
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
 
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState(page.featured_image_url);
  const [imageAlt, setImageAlt] = useState(page.featured_image_alt ?? "");
  const [sections, setSections] = useState<EditableSection[]>(() =>
    initialSections.map(withLocalId)
  );
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
 
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<PageInput>({
    resolver: zodResolver(pageInputSchema),
    defaultValues: {
      page_type: page.page_type,
      parent_section: page.parent_section,
      slug: page.slug,
      title: page.title,
      tag: page.tag ?? "",
      summary: page.summary,
      intro: page.intro ?? "",
      heading: page.heading ?? "",
      body: page.body, // legacy field, no longer editable — see PROJECT_STATUS
      tiers: null, // legacy field, superseded by tiers-type sections
      meta_description: page.meta_description ?? "",
      featured_image_url: page.featured_image_url,
      featured_image_alt: page.featured_image_alt,
      sort_order: page.sort_order,
      show_in_nav: page.show_in_nav,
    },
  });
 
  const titleValue = watch("title");
  const isPublished = page.status === "published";
  const isSingleton = isSingletonPage(page.page_type);
  const isOverview = page.page_type === "overview";
  const previewSlug = isPublished || isSingleton ? page.slug : slugify(titleValue || "");
  const previewPath = getPagePublicPath({ ...page, slug: previewSlug });

  // The homepage and section overview pages get every section type,
  // including the live-data ones (an overview lists its section's pages);
  // other page types stick to the generic ones — services_grid etc.
  // wouldn't make sense standalone on a service or custom page.
  const availableSectionTypes = isSingleton
    ? SECTION_TYPES
    : SECTION_TYPES.filter((t) => !HOME_ONLY_SECTION_TYPES.includes(t));
 
  function addSection(type: SectionType) {
    setSections((prev) => [...prev, withLocalId(createBlankSection(type))]);
  }
 
  function updateSection(localId: string, newSection: PageSection) {
    setSections((prev) =>
      prev.map((s) => (s._localId === localId ? { ...newSection, _localId: localId } : s))
    );
  }
 
  function removeSection(localId: string) {
    setSections((prev) => prev.filter((s) => s._localId !== localId));
  }
 
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s._localId === active.id);
      const newIndex = prev.findIndex((s) => s._localId === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }
 
  // Shared by both media-bearing section types (media, media_text) — only
  // patches image_url on the section currently uploading, leaving every
  // other field (media_type, video_url, size/layout, caption/body) intact.
  function handleSectionImageUpload(localId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingIds((prev) => new Set(prev).add(localId));
    startUploading(async () => {
      const result = await uploadPageImage(formData);
      setUploadingIds((prev) => {
        const next = new Set(prev);
        next.delete(localId);
        return next;
      });
      if (result.ok && result.url) {
        const uploadedUrl = result.url;
        setSections((prev) =>
          prev.map((s) => {
            if (s._localId !== localId) return s;
            if (s.section_type === "media") {
              return { ...s, content: { ...s.content, image_url: uploadedUrl } };
            }
            if (s.section_type === "media_text") {
              return { ...s, content: { ...s.content, image_url: uploadedUrl } };
            }
            if (s.section_type === "hero") {
              return { ...s, content: { ...s.content, image_url: uploadedUrl } };
            }
            if (s.section_type === "issues") {
              return { ...s, content: { ...s.content, image_url: uploadedUrl } };
            }
            return s;
          })
        );
      } else {
        setSaveMessage({ ok: false, text: result.error ?? "Image upload failed." });
      }
    });
  }
 
  // Runs both the page's own field save and the sections replace together
  // — from the admin's perspective this is one Save action, even though
  // it's two backend calls under the hood (pages.* fields vs. the separate
  // page_sections table).
  async function persist(values: PageInput, status?: "draft" | "published") {
    const pageResult = await savePage(
      page.id,
      { ...values, featured_image_url: imageUrl, featured_image_alt: imageAlt, tiers: null },
      status ? { status } : undefined
    );
    const sectionsResult = await saveSections(
      page.id,
      sections.map(({ _localId, ...section }) => section)
    );
    return {
      ok: pageResult.ok && sectionsResult.ok,
      errors: [...(pageResult.errors ?? []), ...(sectionsResult.errors ?? [])],
    };
  }
 
  function onSaveDraft(values: PageInput) {
    setSaveMessage(null);
    startSaving(async () => {
      const result = await persist(values);
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Draft saved." }
          : { ok: false, text: result.errors.join(" ") || "Something went wrong." }
      );
    });
  }
 
  function onPublish(values: PageInput) {
    setSaveMessage(null);
    startPublishing(async () => {
      const result = await persist(values, "published");
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Published." }
          : { ok: false, text: result.errors.join(" ") || "Something went wrong." }
      );
    });
  }
 
  function onUnpublish(values: PageInput) {
    setSaveMessage(null);
    startPublishing(async () => {
      const result = await persist(values, "draft");
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Unpublished." }
          : { ok: false, text: result.errors.join(" ") || "Something went wrong." }
      );
    });
  }
 
  // Concatenates whatever text exists across every section, regardless of
  // type — text/media_text bodies, cta heading+body, tiers names+
  // descriptions. generateMetaDescription strips HTML tags itself, so raw
  // Tiptap HTML can be passed through unmodified here.
  function extractSectionsText(): string {
    return sections
      .map((s) => {
        switch (s.section_type) {
          case "text":
            return s.content.body;
          case "media_text":
            return s.content.body;
          case "cta":
            return `${s.content.heading} ${s.content.body}`;
          case "tiers":
            return [s.content.heading, ...s.content.tiers.map((t) => `${t.name} ${t.description}`)].join(" ");
          case "hero":
            return `${s.content.heading} ${s.content.lead}`;
          case "issues":
            return [s.content.heading, ...s.content.primary_items, ...s.content.secondary_items].join(" ");
          case "features":
          case "steps":
            return [s.content.heading, s.content.intro, ...s.content.items.map((i) => `${i.title} ${i.body}`)].join(" ");
          case "text_checklist":
            return [s.content.body, ...s.content.items].join(" ");
          case "comparison":
            return [s.content.heading, ...s.content.right.items].join(" ");
          case "callout":
            return `${s.content.heading} ${s.content.body}`;
          default:
            return "";
        }
      })
      .join(" ");
  }
 
  function handleGenerateMetaDescription() {
    const { summary } = getValues();
    const generated = generateMetaDescription(summary, extractSectionsText());
    setValue("meta_description", generated, { shouldValidate: true });
  }
 
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    startUploading(async () => {
      const result = await uploadPageImage(formData);
      if (result.ok && result.url) {
        setImageUrl(result.url);
      } else {
        setSaveMessage({ ok: false, text: result.error ?? "Upload failed." });
      }
    });
  }
 
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
      <form onSubmit={handleSubmit(onSaveDraft)} className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          <span>{TYPE_LABEL[page.page_type]}</span>
          {page.parent_section && <span>· {page.parent_section}</span>}
        </div>
 
        {page.page_type !== "home" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {isOverview ? "Page heading" : "Title"}
              {isOverview && <span className="font-normal text-neutral-400"> (the H1 at the top of the page)</span>}
            </label>
            <input className={inputClass} {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
        )}
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">URL</label>
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
            <span className="font-medium text-neutral-700">{previewPath || "…"}</span>
          </div>
          {isOverview ? (
            <p className="mt-1 text-xs text-neutral-400">Fixed — this is the section&apos;s overview page.</p>
          ) : page.page_type !== "home" ? (
            <p className="mt-1 text-xs text-neutral-400">
              {isPublished
                ? "Locked now that this page is published, so existing links keep working."
                : "Generated automatically from the title above."}
            </p>
          ) : null}
        </div>
 
        {page.page_type === "custom" && (
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4">
            <input
              id="show_in_nav"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-neutral-300"
              {...register("show_in_nav")}
            />
            <label htmlFor="show_in_nav" className="text-sm text-neutral-700">
              <span className="font-medium text-neutral-900">Show in main navigation</span>
              <br />
              <span className="text-neutral-500">
                Adds this page as a top-level link in the header, after &ldquo;Blog&rdquo;.
                Leave unchecked for a page only reachable by direct link (e.g. one shared in
                an email or linked from another page).
              </span>
            </label>
          </div>
        )}
 
        {(page.page_type === "program" || isOverview) && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {isOverview ? "Eyebrow" : "Tag"}{" "}
              <span className="font-normal text-neutral-400">
                {isOverview
                  ? "(small label above the heading, e.g. \u201cHow we work\u201d)"
                  : "(e.g. \u201cSubscription\u201d, \u201cThree tiers\u201d)"}
              </span>
            </label>
            <input className={inputClass} {...register("tag")} />
          </div>
        )}
 
        {page.page_type !== "home" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {isOverview ? "Intro" : "Summary"}{" "}
              <span className="font-normal text-neutral-400">
                {isOverview
                  ? "(paragraph under the heading; also used in search results if no meta description is set)"
                  : "(shown on the overview page and in search results)"}
              </span>
            </label>
            <textarea rows={2} className={inputClass} {...register("summary")} />
            {errors.summary && (
              <p className="mt-1 text-xs text-red-600">{errors.summary.message}</p>
            )}
          </div>
        )}

        {(page.page_type === "program" || page.page_type === "service") && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Page heading{" "}
              <span className="font-normal text-neutral-400">
                (optional — the H1 on this page; leave blank to use the title, which stays the label in the nav and on cards)
              </span>
            </label>
            <input className={inputClass} {...register("heading")} />
          </div>
        )}

        {(page.page_type === "program" || page.page_type === "service") && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Page intro{" "}
              <span className="font-normal text-neutral-400">
                (optional — paragraph under the page heading; leave blank to use the summary)
              </span>
            </label>
            <textarea rows={2} className={inputClass} {...register("intro")} />
          </div>
        )}
 
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">Page sections</label>
          </div>
 
          {sections.length === 0 && (
            <p className="mb-3 text-xs text-neutral-400">No sections yet — add one below.</p>
          )}
 
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s._localId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sections.map((section) => (
                  <SortableSectionCard key={section._localId} id={section._localId}>
                    {(dragHandleProps) => (
                      <SectionCard
                        section={section}
                        onChange={(newSection) => updateSection(section._localId, newSection)}
                        onRemove={() => removeSection(section._localId)}
                        uploading={uploadingIds.has(section._localId)}
                        onImageFile={(file) =>
                          handleSectionImageUpload(section._localId, file)
                        }
                        dragHandleProps={dragHandleProps}
                        testimonialOptions={testimonialOptions}
                      />
                    )}
                  </SortableSectionCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
 
          <div className="mt-4 flex flex-wrap gap-2">
            {availableSectionTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSection(type)}
                className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
              >
                + {SECTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
 
        {page.page_type !== "home" && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700">
                Meta description <span className="font-normal text-neutral-400">(SEO, optional)</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateMetaDescription}
                className="text-xs font-medium text-neutral-600 underline hover:text-neutral-900"
              >
                Generate from content
              </button>
            </div>
            <input className={inputClass} {...register("meta_description")} />
            <p className="mt-1 text-xs text-neutral-400">
              {(watch("meta_description")?.length ?? 0)}/160 characters — aim for 150–160
            </p>
          </div>
        )}
 
        {saveMessage && (
          <p className={`text-sm ${saveMessage.ok ? "text-emerald-700" : "text-red-600"}`}>
            {saveMessage.text}
          </p>
        )}
 
        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? "Saving…" : isSingleton ? "Save changes" : "Save draft"}
          </button>
 
          {isSingleton ? null : page.status === "published" ? (
            <button
              type="button"
              disabled={isPublishing}
              onClick={handleSubmit(onUnpublish)}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
            >
              {isPublishing ? "Working…" : "Unpublish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPublishing}
              onClick={handleSubmit(onPublish)}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          )}
 
          {!isSingleton && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                if (confirm("Delete this page? This can't be undone.")) {
                  startDeleting(() => deletePage(page.id));
                }
              }}
              className="ml-auto text-sm font-medium text-red-600 disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Delete page"}
            </button>
          )}
        </div>
      </form>
 
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Featured image</label>
        {imageUrl ? (
          <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border border-neutral-200">
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
            No image uploaded
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="text-sm"
          disabled={isUploading}
        />
        {isUploading && <p className="mt-1 text-xs text-neutral-500">Uploading…</p>}
        <p className="mt-2 text-xs text-neutral-400">JPEG, PNG or WebP, up to 5MB.</p>
        {imageUrl && (
          <input
            className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            placeholder="Alt text (describe the image for screen readers)"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}