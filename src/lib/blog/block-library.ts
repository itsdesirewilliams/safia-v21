import type {
  FaqBlock,
  ImageBlock,
  ImageTextBlock,
  ListExplainBlock,
  PostBlock,
  TableBlock,
  TextBlock,
} from "./blocks";

/** The individual blocks offered by the insert menu. */
export const BLOCK_TYPE_OPTIONS = [
  { type: "text", label: "Text", description: "Rich text with paragraphs." },
  { type: "heading", label: "Heading", description: "Section heading (H2–H4)." },
  { type: "image", label: "Image", description: "Image with an optional caption." },
  {
    type: "imageText",
    label: "Image + text",
    description: "Image beside text, newspaper style.",
  },
  {
    type: "list",
    label: "List explainer",
    description: "One H2 with repeated H3 + paragraph items.",
  },
  { type: "table", label: "Table", description: "Header row with editable cells." },
  { type: "faq", label: "FAQ accordion", description: "Questions and answers." },
] as const;

export type BlockTypeOption = (typeof BLOCK_TYPE_OPTIONS)[number];

const emptyImage = (): ImageBlock => ({
  type: "image",
  mediaId: "",
  alt: null,
  caption: null,
});

const emptyImageText = (): ImageTextBlock => ({
  type: "imageText",
  position: "left",
  mediaId: "",
  caption: null,
  heading: "Image and text",
  html: "<p>Add the supporting text here. Keep it concise and useful.</p>",
});

const emptyText = (): TextBlock => ({
  type: "text",
  html: "<p>Write your paragraph here.</p>",
});

const emptyList = (): ListExplainBlock => ({
  type: "list",
  heading: "A heading that introduces the list",
  items: Array.from({ length: 3 }, (_, index) => ({
    heading: `Point ${index + 1}`,
    html: "<p>Explain this point in a short paragraph.</p>",
  })),
});

const emptyTable = (): TableBlock => ({
  type: "table",
  rows: [
    ["Column 1", "Column 2", "Column 3"],
    ["", "", ""],
    ["", "", ""],
  ],
});

const emptyFaq = (): FaqBlock => ({
  type: "faq",
  heading: "Frequently asked questions",
  items: Array.from({ length: 3 }, (_, index) => ({
    question: `Question ${index + 1}`,
    html: "<p>Answer the question clearly and concisely.</p>",
  })),
});

/** Create an empty block of a given type. */
export function createBlock(type: BlockTypeOption["type"]): PostBlock {
  switch (type) {
    case "heading":
      return { type: "heading", level: 2, text: "" };
    case "image":
      return emptyImage();
    case "imageText":
      return emptyImageText();
    case "list":
      return emptyList();
    case "table":
      return emptyTable();
    case "faq":
      return emptyFaq();
    case "text":
    default:
      return emptyText();
  }
}

export type BlockComponent = {
  id: string;
  label: string;
  description: string;
  create: () => PostBlock[];
};

/** One-click pre-built block groups. Add an entry to extend the menu. */
export const BLOCK_COMPONENTS: readonly BlockComponent[] = [
  {
    id: "heading-image-text",
    label: "Heading + image + text",
    description: "A section heading, a full-width image and a paragraph.",
    create: () => [
      { type: "heading", level: 2, text: "Section heading" },
      emptyImage(),
      {
        type: "text",
        html: "<p>Add the introduction to this section here.</p>",
      },
    ],
  },
  {
    id: "five-factors",
    label: "Five factors",
    description: "An H2 with five H3 factors and a paragraph for each.",
    create: () => [
      {
        type: "list",
        heading: "Five factors to consider",
        items: Array.from({ length: 5 }, (_, index) => ({
          heading: `Factor ${index + 1}`,
          html: "<p>Explain this factor and why it matters.</p>",
        })),
      } satisfies ListExplainBlock,
    ],
  },
  {
    id: "image-text-newspaper",
    label: "Image + text",
    description: "A smaller image with text beside it; image left or right.",
    create: () => [emptyImageText()],
  },
  {
    id: "faq",
    label: "FAQ accordion",
    description: "An H2 with collapsible question and answer items.",
    create: () => [emptyFaq()],
  },
];
