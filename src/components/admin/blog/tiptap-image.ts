import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

/**
 * The stock Tiptap image node, extended with the metadata the Safeway blog
 * needs: the Media-layer id, caption, alignment and percentage width. The
 * public renderer still receives ordinary ImageBlock values.
 */
export const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attributes) =>
          attributes.mediaId
            ? { "data-media-id": attributes.mediaId }
            : {},
      },
      caption: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-caption") ?? element.getAttribute("title"),
        renderHTML: (attributes) =>
          attributes.caption ? { "data-caption": attributes.caption } : {},
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes) =>
          attributes.align ? { "data-align": attributes.align } : {},
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute("data-width");
          if (!raw) return null;
          const value = Number(raw);
          return Number.isFinite(value) && value > 0 ? value : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            "data-width": String(attributes.width),
            style: `width:${attributes.width}%`,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },
}).configure({
  inline: false,
  allowBase64: false,
});
