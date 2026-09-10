/**
 * The nine Lean Canvas blocks (plus three sub-blocks), with the grid
 * placement that reproduces Ash Maurya's layout. `area` maps to a
 * named grid-template-area in index.css.
 */
export type BlockDef = {
  id: string;
  area: string;
  n?: number;
  title: string;
  hint: string;
  placeholder: string;
};

export const BLOCKS: BlockDef[] = [
  {
    id: "problem",
    area: "problem",
    n: 1,
    title: "Problem",
    hint: "Top 1–3 problems your customer has.",
    placeholder: "1.\n2.\n3.",
  },
  {
    id: "existingAlternatives",
    area: "alternatives",
    title: "Existing Alternatives",
    hint: "How these problems get solved today.",
    placeholder: "Spreadsheets, doing nothing, a competitor…",
  },
  {
    id: "solution",
    area: "solution",
    n: 4,
    title: "Solution",
    hint: "The smallest feature set that addresses each problem.",
    placeholder: "1.\n2.\n3.",
  },
  {
    id: "keyMetrics",
    area: "metrics",
    n: 8,
    title: "Key Metrics",
    hint: "The few numbers that tell you the business is working.",
    placeholder: "Acquisition, activation, retention, revenue, referral…",
  },
  {
    id: "uvp",
    area: "uvp",
    n: 3,
    title: "Unique Value Proposition",
    hint: "One clear, compelling message on why you're different and worth buying.",
    placeholder: "A single sentence a customer would repeat to a colleague.",
  },
  {
    id: "highLevelConcept",
    area: "concept",
    title: "High-Level Concept",
    hint: "Your X-for-Y analogy.",
    placeholder: "“Flickr for video”",
  },
  {
    id: "unfairAdvantage",
    area: "advantage",
    n: 9,
    title: "Unfair Advantage",
    hint: "Something that can't be easily copied or bought. Fine to leave blank early.",
    placeholder: "Insider info, a real endorsement, a network effect…",
  },
  {
    id: "channels",
    area: "channels",
    n: 5,
    title: "Channels",
    hint: "Your paths to customers — free/paid, inbound/outbound.",
    placeholder: "SEO, community, sales calls, partnerships…",
  },
  {
    id: "customerSegments",
    area: "segments",
    n: 2,
    title: "Customer Segments",
    hint: "Who has this problem.",
    placeholder: "Who you're building for.",
  },
  {
    id: "earlyAdopters",
    area: "adopters",
    title: "Early Adopters",
    hint: "The narrow group that feels the problem most acutely.",
    placeholder: "Characteristics of your ideal first customer.",
  },
  {
    id: "costStructure",
    area: "costs",
    n: 7,
    title: "Cost Structure",
    hint: "Acquisition cost, distribution, hosting, people.",
    placeholder: "Fixed and variable costs.",
  },
  {
    id: "revenueStreams",
    area: "revenue",
    n: 6,
    title: "Revenue Streams",
    hint: "Pricing model, lifetime value, revenue.",
    placeholder: "How you make money.",
  },
];

/** Suggested fill order: Problem → Segments → UVP → Solution → … */
export const FILL_ORDER = BLOCKS.filter(b => b.n).sort((a, b) => a.n! - b.n!);
