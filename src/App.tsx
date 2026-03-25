import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type CategoryId = "ai-jobs" | "market-games" | "ceo-clowns";

type CategoryConfig = {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
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
      "Automation, replacement arcs, and the moment the tool starts doing the founder's job too.",
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
      "Insider timing, geopolitical choreography, and headlines that seem to arrive right on schedule.",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/market-games.md",
    accentClass: "bg-[#E1F3FE]",
    textAccentClass: "text-[#1F6C9F]",
  },
  {
    id: "ceo-clowns",
    label: "CEO Clowns",
    shortLabel: "hypocrisy",
    description:
      "Executive hypocrisy, corporate reversals, and elite contradictions dressed up as leadership.",
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
      { threshold: 0.18 },
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
      className={`min-w-20 rounded-md border px-3 py-2 text-xs uppercase tracking-[0.08em] transition ${
        copied
          ? "border-[#EAEAEA] bg-[#EDF3EC] text-[#346538]"
          : "border-[#EAEAEA] bg-white text-[#2F3437] hover:bg-[#F7F6F3]"
      }`}
    >
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
    <div className="relative min-h-screen overflow-hidden bg-[#F7F6F3] text-[#111111]">
      <div className="pointer-events-none fixed inset-0 opacity-100">
        <div className="absolute left-[-12%] top-[8%] h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(251,243,219,0.9)_0%,_rgba(251,243,219,0)_72%)]" />
        <div className="absolute bottom-[10%] right-[-8%] h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(225,243,254,0.55)_0%,_rgba(225,243,254,0)_72%)]" />
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <Reveal>
          <header className="mb-10 border-b border-[#EAEAEA] pb-6 sm:mb-14 sm:pb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded-full bg-[#FBF3DB] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#956400]">
                quote tweet tool
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#787774] border border-[#EAEAEA]">
                {PERSON_NAME}
              </span>
            </div>

            <div className="max-w-4xl">
              <h1 className="font-serif text-[2.8rem] leading-[0.98] tracking-[-0.04em] text-[#111111] sm:text-6xl lg:text-7xl">
                Tweet Bangers
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#787774] sm:mt-5 sm:text-base sm:leading-8">
                Clean input. Exact tone match. Three quote tweets back.
              </p>
            </div>
          </header>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.92fr] lg:gap-6">
          <Reveal index={1}>
            <section className="rounded-xl border border-[#EAEAEA] bg-[#F9F9F8] p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#EAEAEA] pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#787774]">
                    Categories
                  </p>
                  <h2 className="mt-2 font-serif text-2xl tracking-[-0.03em] sm:text-3xl">
                    Pick a lane
                  </h2>
                </div>
                {activeCategory ? (
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${activeCategory.accentClass} ${activeCategory.textAccentClass}`}
                  >
                    {activeCategory.shortLabel}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {CATEGORIES.map((category, index) => {
                  const isActive = selectedCategory === category.id;
                  const isFetching = loadingCategory === category.id;
                  const hasLoadedExamples = Boolean(examplesByCategory[category.id]);

                  return (
                    <Reveal key={category.id} index={index + 2}>
                      <button
                        onClick={() => void handleCategorySelect(category.id)}
                        className={`h-full min-h-[210px] rounded-xl border p-4 text-left transition sm:min-h-[230px] sm:p-5 ${
                          isActive
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#EAEAEA] bg-white hover:border-[#CFCFCB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[15px] font-semibold leading-6 sm:text-base">
                              {category.label}
                            </h3>
                          </div>
                          <span className="mt-1 text-xs uppercase tracking-[0.18em] text-[#787774]">
                            {isFetching ? "..." : hasLoadedExamples ? "ok" : "go"}
                          </span>
                        </div>
                        <p
                          className={`text-sm leading-7 sm:leading-8 ${
                            isActive ? "text-white/72" : "text-[#787774]"
                          }`}
                        >
                          {category.description}
                        </p>
                      </button>
                    </Reveal>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-[#EAEAEA] pt-6 sm:mt-10 sm:pt-8">
                <label className="mb-3 block text-sm text-[#2F3437]">
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
                  className="w-full resize-none rounded-xl border border-[#EAEAEA] bg-white px-4 py-4 text-[15px] leading-7 text-[#111111] outline-none transition placeholder:text-[#A3A3A0] focus:border-[#111111] sm:px-5 sm:leading-8"
                />

                <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    onClick={() => void generate()}
                    disabled={loading}
                    className="w-full rounded-md bg-[#111111] px-6 py-3 text-sm text-white transition hover:bg-[#333333] active:scale-[0.98] disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? "Generating" : "Banger it"}
                  </button>

                  <kbd className="rounded border border-[#EAEAEA] bg-[#F7F6F3] px-2.5 py-1.5 font-mono text-xs text-[#787774]">
                    ctrl + enter
                  </kbd>
                </div>

                {error ? (
                  <div className="mt-6 rounded-xl border border-[#F2D7D9] bg-[#FDEBEC] px-4 py-3 text-sm text-[#9F2F2D]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-[#9F2F2D]" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </Reveal>

          <Reveal index={2}>
            <section className="rounded-xl border border-[#EAEAEA] bg-white p-4 sm:p-6 lg:p-8">
              <div className="mb-8 border-b border-[#EAEAEA] pb-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#787774]">
                  Output
                </p>
                <h2 className="mt-2 font-serif text-2xl tracking-[-0.03em] sm:text-3xl">
                  Three drafts
                </h2>
              </div>

              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#EAEAEA] bg-[#FBFBFA] p-5 text-sm leading-7 text-[#787774] sm:p-6 sm:leading-8">
                  Choose a category and run the generator.
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((text, index) => (
                    <Reveal key={`${index}-${text}`} index={index + 3}>
                      <article className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-5">
                        <div className="mb-4 flex items-start gap-3 sm:gap-4">
                          <span className="font-mono text-xs text-[#787774]">
                            0{index + 1}
                          </span>
                          <p className="flex-1 text-[15px] leading-7 text-[#2F3437] sm:leading-8">
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
