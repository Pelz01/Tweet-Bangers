import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type CategoryId = "ai-jobs" | "market-games" | "ceo-clowns";

type CategoryConfig = {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
  summary: string;
  rawUrl: string;
  accentClass: string;
  textAccentClass: string;
};

const API_ENDPOINT = "/api/generate";
const PERSON_NAME = "Tuki";

const CATEGORIES: CategoryConfig[] = [
  {
    id: "ai-jobs",
    label: "AI & Jobs",
    shortLabel: "automation",
    description:
      "Use this when the tweet is about AI replacing jobs, companies cutting workers while building AI, or founders automating the same roles they just eliminated.",
    summary: "Layoffs, replacement arcs, and founders deleting the same roles they cut.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/ai-jobs.md",
    accentClass: "bg-[#EDF3EC]",
    textAccentClass: "text-[#346538]",
  },
  {
    id: "market-games",
    label: "Market Games",
    shortLabel: "timing",
    description:
      "Use this when the tweet is about suspiciously timed trades, insider moves, geopolitical decisions that happen to benefit someone's portfolio, or money flowing before the news breaks.",
    summary: "Suspicious trades, convenient timing, and money moving before headlines.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/market-games.md",
    accentClass: "bg-[#E1F3FE]",
    textAccentClass: "text-[#1F6C9F]",
  },
  {
    id: "ceo-clowns",
    label: "CEO/Big Shark",
    shortLabel: "public lie",
    description:
      "Use this when the tweet is about a CEO, institution, or powerful company saying one thing publicly and doing the exact opposite — BlackRock on Bitcoin, OpenAI on its mission, Tim Cook on screen time. The public statement is always the lie.",
    summary: "The public line is clean. The actual behavior says the opposite.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/ceo-clowns.md",
    accentClass: "bg-[#FDEBEC]",
    textAccentClass: "text-[#9F2F2D]",
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

function buildUserPrompt(personName: string, examples: string, tweet: string) {
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

function Reveal({
  children,
  index = 0,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`${className} transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {children}
    </div>
  );
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
      className={`rounded-md border px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition ${
        copied
          ? "border-[#EAEAEA] bg-[#EDF3EC] text-[#346538]"
          : "border-[#EAEAEA] bg-white text-[#2F3437] hover:bg-[#F7F6F3] active:scale-[0.98]"
      }`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>("ai-jobs");
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
          prompt: buildUserPrompt(PERSON_NAME, examples, tweet.trim()),
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
    <div className="relative min-h-screen overflow-hidden bg-[#FBFBFA] text-[#111111]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-0 top-0 h-64 w-64 bg-[radial-gradient(circle,_rgba(251,243,219,0.75)_0%,_rgba(251,243,219,0)_72%)]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 bg-[radial-gradient(circle,_rgba(225,243,254,0.32)_0%,_rgba(225,243,254,0)_74%)]" />
      </div>

      <main className="relative mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
        <Reveal>
          <header className="mb-4 rounded-xl border border-[#EAEAEA] bg-white p-4 sm:mb-6 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#FBF3DB] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#956400]">
                quote tweet tool
              </span>
              <span className="rounded-full border border-[#EAEAEA] bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#787774]">
                {PERSON_NAME}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-[3.25rem]">
                  Tweet Bangers
                </h1>
                <p className="mt-2 text-[13px] leading-6 text-[#787774] sm:text-sm sm:leading-7">
                  Pick a lane. Paste the tweet. Get three clean drafts back.
                </p>
              </div>

              {activeCategory ? (
                <div className={`rounded-xl border border-[#EAEAEA] px-4 py-3 ${activeCategory.accentClass}`}>
                  <p className={`text-[10px] uppercase tracking-[0.14em] ${activeCategory.textAccentClass}`}>
                    active
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#111111]">
                    {activeCategory.label}
                  </p>
                </div>
              ) : null}
            </div>
          </header>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1.18fr_0.94fr] lg:gap-5">
          <Reveal index={1}>
            <section className="rounded-xl border border-[#EAEAEA] bg-[#F9F9F8] p-3 sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#787774]">
                    Categories
                  </p>
                  <h2 className="mt-1 text-lg font-medium tracking-[-0.03em] text-[#111111] sm:text-xl">
                    Choose a lane
                  </h2>
                </div>

                {activeCategory ? (
                  <span className={`hidden rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] sm:inline-flex ${activeCategory.accentClass} ${activeCategory.textAccentClass}`}>
                    {activeCategory.shortLabel}
                  </span>
                ) : null}
              </div>

              <div className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 lg:mx-0 lg:grid lg:grid-cols-[0.95fr_1.15fr] lg:grid-rows-2 lg:gap-3 lg:overflow-visible lg:px-0">
                {CATEGORIES.map((category, index) => {
                  const isActive = selectedCategory === category.id;
                  const isFetching = loadingCategory === category.id;
                  const hasLoadedExamples = Boolean(examplesByCategory[category.id]);
                  const desktopClass =
                    category.id === "ai-jobs"
                      ? "lg:row-span-2"
                      : category.id === "market-games"
                        ? "lg:col-start-2 lg:row-start-1"
                        : "lg:col-start-2 lg:row-start-2";

                  return (
                    <Reveal key={category.id} index={index + 2} className={desktopClass}>
                      <button
                        onClick={() => void handleCategorySelect(category.id)}
                        className={`h-full min-h-[130px] w-[72vw] max-w-[262px] shrink-0 snap-start rounded-xl border p-3.5 text-left transition lg:w-auto lg:max-w-none ${
                          isActive
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#EAEAEA] bg-white hover:border-[#CFCFCB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[14px] font-semibold leading-5 sm:text-[15px]">
                              {category.label}
                            </h3>
                            <p
                              className={`mt-3 max-w-[20ch] text-[13px] leading-6 ${
                                isActive ? "text-white/74" : "text-[#787774]"
                              }`}
                            >
                              {category.summary}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-[9px] uppercase tracking-[0.14em] ${
                              isActive
                                ? "bg-white/10 text-white/72"
                                : hasLoadedExamples
                                  ? `${category.accentClass} ${category.textAccentClass}`
                                  : "border border-[#EAEAEA] text-[#A3A3A0]"
                            }`}
                          >
                            {isFetching ? "load" : hasLoadedExamples ? "ready" : "fetch"}
                          </span>
                        </div>
                      </button>
                    </Reveal>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-[#EAEAEA] bg-white p-3.5 sm:p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#787774]">
                  Current brief
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#787774] sm:text-sm sm:leading-7">
                  {activeCategory?.description}
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-[#EAEAEA] bg-white p-3.5 sm:p-4">
                <label className="mb-2 block text-[12px] uppercase tracking-[0.12em] text-[#787774]">
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
                  rows={5}
                  placeholder="Paste the tweet text here..."
                  className="w-full resize-none rounded-lg border border-[#EAEAEA] bg-[#FBFBFA] px-4 py-3 text-[15px] leading-7 text-[#111111] outline-none transition placeholder:text-[#A3A3A0] focus:border-[#111111]"
                />

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => void generate()}
                    disabled={loading}
                    className="rounded-md bg-[#111111] px-5 py-3 text-sm text-white transition hover:bg-[#2F3437] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Generating" : "Banger it"}
                  </button>

                  <kbd className="w-fit rounded border border-[#EAEAEA] bg-[#F7F6F3] px-2.5 py-1.5 font-mono text-[11px] text-[#787774]">
                    ctrl + enter
                  </kbd>
                </div>
              </div>

              {error ? (
                <div className="mt-3 rounded-xl border border-[#F2D7D9] bg-[#FDEBEC] px-4 py-3 text-sm text-[#9F2F2D]">
                  {error}
                </div>
              ) : null}
            </section>
          </Reveal>

          <Reveal index={2}>
            <section className="rounded-xl border border-[#EAEAEA] bg-white p-3 sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#787774]">
                    Output
                  </p>
                  <h2 className="mt-1 text-lg font-medium tracking-[-0.03em] text-[#111111] sm:text-xl">
                    Three drafts
                  </h2>
                </div>
                <span className="rounded-full border border-[#EAEAEA] bg-[#F7F6F3] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#787774]">
                  live
                </span>
              </div>

              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#EAEAEA] bg-[#FBFBFA] p-4 text-[13px] leading-6 text-[#787774]">
                  Choose a category and run the generator.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((text, index) => (
                    <Reveal key={`${index}-${text}`} index={index + 3}>
                      <article className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4">
                        <div className="mb-4 flex items-start gap-3">
                          <span className="rounded-md bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#787774] border border-[#EAEAEA]">
                            0{index + 1}
                          </span>
                          <p className="flex-1 text-[14px] leading-6 text-[#2F3437] sm:text-[15px] sm:leading-7">
                            {text}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <CopyButton text={text} />
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
