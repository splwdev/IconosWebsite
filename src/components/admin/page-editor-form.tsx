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
import { pageInputSchema, slugify, type PageInput } from "@/lib/content/pages";
import {
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  SECTION_BACKGROUNDS,
  IMAGE_TEXT_LAYOUTS,
  createBlankSection,
  type PageSection,
  type SectionType,
  type TextSectionContent,
  type ImageTextSectionContent,
  type CtaSectionContent,
  type TiersSectionContent,
} from "@/lib/content/page-sections";
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
};
 
// A stable client-only id purely for React keys / drag-and-drop identity —
// never persisted. Saving does a full replace of the section list (see
// saveSections/replace_page_sections), so the database never tracks
// individual section ids across saves either — nothing to keep in sync.
type EditableSection = PageSection & { _localId: string };
 
function withLocalId(section: PageSection): EditableSection {
  return { ...section, _localId: crypto.randomUUID() };
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
  return <RichTextEditor content={content.body} onChange={(html) => onChange({ body: html })} />;
}
 
function ImageTextSectionFields({
  content,
  onChange,
  uploading,
  onImageFile,
}: {
  content: ImageTextSectionContent;
  onChange: (content: ImageTextSectionContent) => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Image</label>
          {content.image_url ? (
            <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border border-neutral-200">
              <Image src={content.image_url} alt="" fill className="object-cover" unoptimized />
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
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Image position
          </label>
          <div className="flex gap-2">
            {IMAGE_TEXT_LAYOUTS.map((layout) => (
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
                {layout === "image-left" ? "Image left" : "Image right"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <RichTextEditor
        content={content.body}
        onChange={(html) => onChange({ ...content, body: html })}
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
    </div>
  );
}
 
function TiersSectionFields({
  content,
  onChange,
}: {
  content: TiersSectionContent;
  onChange: (content: TiersSectionContent) => void;
}) {
  function addTier() {
    onChange({ tiers: [...content.tiers, { name: "", description: "" }] });
  }
  function updateTier(index: number, field: "name" | "description", value: string) {
    onChange({
      tiers: content.tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    });
  }
  function removeTier(index: number) {
    onChange({ tiers: content.tiers.filter((_, i) => i !== index) });
  }
 
  return (
    <div className="space-y-3">
      {content.tiers.map((tier, index) => (
        <div key={index} className="flex gap-2 rounded-lg border border-neutral-200 p-3">
          <div className="flex-1 space-y-2">
            <input
              className={inputClass}
              placeholder="Tier name"
              value={tier.name}
              onChange={(e) => updateTier(index, "name", e.target.value)}
            />
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Description"
              value={tier.description}
              onChange={(e) => updateTier(index, "description", e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeTier(index)}
            className="self-start text-xs font-medium text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addTier}
        className="text-xs font-medium text-neutral-600 underline"
      >
        + Add tier
      </button>
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
}: {
  section: EditableSection;
  onChange: (section: PageSection) => void;
  onRemove: () => void;
  uploading: boolean;
  onImageFile: (file: File) => void;
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
      {section.section_type === "image_text" && (
        <ImageTextSectionFields
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
    </div>
  );
}
 
// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------
 
export function PageEditorForm({
  page,
  initialSections,
}: {
  page: Page;
  initialSections: PageSection[];
}) {
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
 
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState(page.featured_image_url);
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
      body: page.body, // legacy field, no longer editable — see PROJECT_STATUS
      tiers: null, // legacy field, superseded by tiers-type sections
      meta_description: page.meta_description ?? "",
      featured_image_url: page.featured_image_url,
      sort_order: page.sort_order,
      show_in_nav: page.show_in_nav,
    },
  });
 
  const titleValue = watch("title");
  const isPublished = page.status === "published";
  const previewSlug = isPublished ? page.slug : slugify(titleValue || "");
  const previewPath =
    page.page_type === "custom" ? `/${previewSlug}` : `/${page.parent_section}/${previewSlug}`;
 
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
        setSections((prev) =>
          prev.map((s) =>
            s._localId === localId && s.section_type === "image_text"
              ? { ...s, content: { ...s.content, image_url: result.url! } }
              : s
          )
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
      { ...values, featured_image_url: imageUrl, tiers: null },
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
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Title</label>
          <input className={inputClass} {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">URL</label>
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
            <span className="font-medium text-neutral-700">{previewPath || "…"}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            {isPublished
              ? "Locked now that this page is published, so existing links keep working."
              : "Generated automatically from the title above."}
          </p>
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
 
        {page.page_type === "program" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Tag{" "}
              <span className="font-normal text-neutral-400">
                (e.g. &ldquo;Subscription&rdquo;, &ldquo;Three tiers&rdquo;)
              </span>
            </label>
            <input className={inputClass} {...register("tag")} />
          </div>
        )}
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Summary{" "}
            <span className="font-normal text-neutral-400">
              (shown on the overview page and in search results)
            </span>
          </label>
          <textarea rows={2} className={inputClass} {...register("summary")} />
          {errors.summary && (
            <p className="mt-1 text-xs text-red-600">{errors.summary.message}</p>
          )}
        </div>
 
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
                      />
                    )}
                  </SortableSectionCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
 
          <div className="mt-4 flex flex-wrap gap-2">
            {SECTION_TYPES.map((type) => (
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
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Meta description <span className="font-normal text-neutral-400">(SEO, optional)</span>
          </label>
          <input className={inputClass} {...register("meta_description")} />
        </div>
 
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
            {isSaving ? "Saving…" : "Save draft"}
          </button>
 
          {page.status === "published" ? (
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
        </div>
      </form>
 
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Featured image</label>
        {imageUrl ? (
          <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border border-neutral-200">
            <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
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
      </div>
    </div>
  );
}