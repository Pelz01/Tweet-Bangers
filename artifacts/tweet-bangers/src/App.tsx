import { useMemo, useState } from "react";
import { AlertCircle, Check, Copy, Loader2, RefreshCcw } from "lucide-react";

type CategoryId = "ai-jobs" | "market-games" | "ceo-clowns";

type CategoryConfig = {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
  rawUrl: string;
};

const API_ENDPOINT = "/api/generate";
const PERSON_NAME = "Tuki";

const CATEGORIES: CategoryConfig[] = [
  {
    id: "ai-jobs",
    label: "AI & Jobs",
    shortLabel: "AI Disruption",
    description:
      "Automation, job replacement, startup irony, and the part where the tool starts doing the founder's job too.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/ai-jobs.md",
  },
  {
    id: "market-games",
    label: "Market Games",
    shortLabel: "Market Theater",
    description:
      "Insider timing, geopolitical trades, and narrative flips that seem to arrive right on schedule.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/market-games.md",
  },
  {
    id: "ceo-clowns",
    label: "CEO Clowns",
    shortLabel: "Elite Contradictions",
    description:
      "Executive hypocrisy, corporate spin, billionaire delusion, and elite contradictions dressed up as leadership.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/ceo-clowns.md",
  },
];

function parseResponses(raw: string): string[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const numbered = lines
    .map((line) => line.match(/^[123][.)-]?\s*(.+)/)?.[1]?.trim() ?? null)
    .filter((value): value is string => Boolean(value));

  if (numbered.length >= 3) return numbered.slice(0, 3);

  return lines.slice(0, 3).map((line) => line.replace(/^[123][.)-]?\s*/, "").trim());
}

function buildPrompt(personName: string, examples: string, tweet: string) {
  return `You are mimicking ${personName}'s quote tweet style.

Here are examples of how they quote tweets in this category:
${examples}

Generate 3 quote tweet variations for this tweet:
${tweet}

Rules:
- Match their tone, length, and structure exactly
- Return only the 3 variations, numbered 1-3
- No explanation, no hashtags, no extra commentary`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        copied
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950"
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [tweet, setTweet] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState<CategoryId | null>(null);
  const [error, setError] = useState("");
  const [examplesByCategory, setExamplesByCategory] = useState<
    Partial<Record<CategoryId, string>>
  >({});

  const activeCategory = useMemo(
    () => CATEGORIES.find((item) => item.id === selectedCategory) ?? null,
    [selectedCategory],
  );

  async function loadCategoryExamples(categoryId: CategoryId, force = false) {
    const category = CATEGORIES.find((item) => item.id === categoryId);
    if (!category) throw new Error("Unknown category.");

    if (!force && examplesByCategory[categoryId]) {
      return examplesByCategory[categoryId]!;
    }

    setLoadingCategory(categoryId);

    try {
      const response = await fetch(category.rawUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Couldn't fetch examples from GitHub (${response.status}).`);
      }

      const markdown = await response.text();
      if (!markdown.trim()) {
        throw new Error("That markdown file is empty.");
      }

      setExamplesByCategory((current) => ({ ...current, [categoryId]: markdown }));
      return markdown;
    } finally {
      setLoadingCategory(null);
    }
  }

  async function handleCategorySelect(categoryId: CategoryId) {
    setSelectedCategory(categoryId);
    setError("");

    try {
      await loadCategoryExamples(categoryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load examples.");
    }
  }

  async function generate() {
    if (!selectedCategory) {
      setError("Choose a category first.");
      return;
    }

    if (!tweet.trim()) {
      setError("Paste a tweet to quote first.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const examples =
        examplesByCategory[selectedCategory] ??
        (await loadCategoryExamples(selectedCategory));

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: buildPrompt(PERSON_NAME, examples, tweet.trim()),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? `Generation failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as { text?: string };
      const raw = payload.text?.trim();
      if (!raw) {
        throw new Error("The model returned an empty response.");
      }

      const parsed = parseResponses(raw);
      setResults(parsed.length ? parsed : [raw]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while generating.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.10),_transparent_24%),linear-gradient(180deg,_#f8f5ef_0%,_#f3ede2_52%,_#efe7db_100%)] text-stone-950">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.76),_rgba(255,251,245,0.88))] p-6 shadow-[0_20px_80px_rgba(71,48,24,0.10)] backdrop-blur sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-stone-500">
                  Quote Tweet Lab
                </p>
                <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight text-stone-950 sm:text-6xl">
                  Tweet Bangers
                </h1>
              </div>

              {activeCategory ? (
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs text-stone-600">
                  {activeCategory.shortLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {CATEGORIES.map((category) => {
                const isActive = selectedCategory === category.id;
                const hasLoadedExamples = Boolean(examplesByCategory[category.id]);
                const isFetching = loadingCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => void handleCategorySelect(category.id)}
                    className={`rounded-[26px] border p-5 text-left transition ${
                      isActive
                        ? "border-stone-950 bg-stone-950 text-stone-50 shadow-[0_18px_40px_rgba(20,16,12,0.16)]"
                        : "border-stone-200 bg-white/80 hover:-translate-y-0.5 hover:border-stone-400 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{category.label}</span>
                      {isFetching ? (
                        <Loader2 size={14} className="animate-spin text-current" />
                      ) : hasLoadedExamples ? (
                        <Check
                          size={14}
                          className={isActive ? "text-emerald-300" : "text-emerald-600"}
                        />
                      ) : (
                        <RefreshCcw
                          size={14}
                          className={isActive ? "text-stone-300" : "text-stone-500"}
                        />
                      )}
                    </div>
                    <p className={`mt-3 text-xs leading-6 ${isActive ? "text-stone-300" : "text-stone-500"}`}>
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <label className="mb-3 block text-sm font-medium text-stone-800">
                Tweet to quote
              </label>
              <textarea
                value={tweet}
                onChange={(e) => setTweet(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    void generate();
                  }
                }}
                rows={8}
                placeholder="Paste the tweet text here..."
                className="w-full rounded-[30px] border border-stone-200 bg-white/90 px-5 py-4 text-sm leading-7 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => void generate()}
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-950 px-6 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Banging...
                  </>
                ) : (
                  "Banger it"
                )}
              </button>

            </div>

            {error ? (
              <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </section>

          <section className="rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,250,244,0.86),_rgba(249,245,238,0.96))] p-6 shadow-[0_20px_80px_rgba(71,48,24,0.08)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                  Output
                </p>
                <h2 className="mt-3 font-serif text-3xl text-stone-950">
                  3 quote tweet variations
                </h2>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-stone-300 bg-white/60 p-6 text-sm leading-7 text-stone-500">
                Choose a category and run the generator. Your three quote tweet
                cards will land here with one-click copy buttons.
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {results.map((text, index) => (
                  <article
                    key={`${index}-${text}`}
                    className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_12px_30px_rgba(71,48,24,0.06)]"
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <span className="mt-0.5 font-serif text-3xl leading-none text-stone-300">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-7 text-stone-800">{text}</p>
                    </div>
                    <div className="flex justify-end">
                      <CopyButton text={text} />
                    </div>
                  </article>
                ))}
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
  );
}
