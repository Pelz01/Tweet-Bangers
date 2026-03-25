import { useEffect, useRef, useState, type ReactNode } from "react";

type CategoryId = "ai-jobs" | "market-games" | "ceo-clowns";

type CategoryConfig = {
  id: CategoryId;
  rawUrl: string;
};

const API_ENDPOINT = "/api/generate";
const PERSON_NAME = "Tuki";

const CATEGORIES: CategoryConfig[] = [
  {
    id: "ai-jobs",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/ai-jobs.md",
  },
  {
    id: "market-games",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/market-games.md",
  },
  {
    id: "ceo-clowns",
    rawUrl:
      "https://raw.githubusercontent.com/Pelz01/Tweet-Bangers/master/examples/ceo-clowns.md",
  },
];

function parseSingleResponse(raw: string): string {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  return normalized.replace(/^[123][.)-]?\s*/, "").trim();
}

function buildUserPrompt(personName: string, examples: string, tweet: string) {
  return `You are mimicking ${personName}'s quote tweet style.

Here are examples of how they quote tweets in this category:
${examples}

Generate exactly 1 quote tweet variation for this tweet:
${tweet}

Rules:
- Match their tone, length, and structure exactly
- Return only the quote tweet
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

function LoadingDrafts() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-3.5 sm:p-4"
        >
          <div className="mb-4 flex items-start gap-3">
            <span className="rounded-md border border-[#EAEAEA] bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#787774]">
              0{index + 1}
            </span>
            <div className="flex-1 space-y-2.5 pt-0.5">
              <div className="h-3 animate-pulse rounded bg-[#F0EFEC]" />
              <div className="h-3 w-[88%] animate-pulse rounded bg-[#F0EFEC]" />
              <div className="h-3 w-[72%] animate-pulse rounded bg-[#F0EFEC]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tweet, setTweet] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [expandedDraftIndex, setExpandedDraftIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [examplesByCategory, setExamplesByCategory] = useState<
    Partial<Record<CategoryId, string>>
  >({});

  async function loadCategoryExamples(categoryId: CategoryId, force = false) {
    const category = CATEGORIES.find((item) => item.id === categoryId);
    if (!category) throw new Error("Unknown category.");

    if (!force && examplesByCategory[categoryId]) {
      return examplesByCategory[categoryId]!;
    }

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
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to load examples.");
    }
  }

  async function generate() {
    if (!tweet.trim()) {
      setError("Paste a tweet to quote first.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setExpandedDraftIndex(null);

    try {
      const exampleSets = await Promise.all(
        CATEGORIES.map(async (category) => ({
          categoryId: category.id,
          examples:
            examplesByCategory[category.id] ?? (await loadCategoryExamples(category.id)),
        })),
      );

      const generationResults = await Promise.allSettled(
        exampleSets.map(async ({ examples }) => {
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
            throw new Error(
              payload?.error ?? `Generation failed with status ${response.status}.`,
            );
          }

          const payload = (await response.json()) as { text?: string };
          const raw = payload.text?.trim();
          if (!raw) {
            throw new Error("The model returned an empty response.");
          }

          return parseSingleResponse(raw);
        }),
      );

      const successfulResults = generationResults
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === "fulfilled" && Boolean(result.value?.trim()),
        )
        .map((result) => result.value.trim());

      if (successfulResults.length === 0) {
        throw new Error("No drafts came back.");
      }

      setResults(successfulResults);

      const failedCount = generationResults.length - successfulResults.length;
      if (failedCount > 0) {
        setError(`${failedCount} pass${failedCount > 1 ? "es" : ""} missed. Showing what came back.`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while generating.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FBFBFA] text-[#111111]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-0 top-0 h-64 w-64 bg-[radial-gradient(circle,_rgba(251,243,219,0.75)_0%,_rgba(251,243,219,0)_72%)]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 bg-[radial-gradient(circle,_rgba(225,243,254,0.32)_0%,_rgba(225,243,254,0)_74%)]" />
      </div>

      <main className="relative mx-auto max-w-6xl overflow-x-hidden px-3 py-5 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
        <Reveal>
          <header className="mb-4 rounded-xl border border-[#EAEAEA] bg-white p-4 sm:mb-6 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#FBF3DB] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#956400]">
                quote tweet tool
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111111] sm:text-[3.25rem]">
                  Tweet Bangers
                </h1>
                <p className="mt-2 text-[13px] leading-6 text-[#787774] sm:text-sm sm:leading-7">
                  Paste a tweet and 3 variations of tweets you quote it with.
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#787774] sm:text-sm sm:leading-7">
                  Pick one of these{" "}
                  <a
                    href="https://x.com/ayman_web3/status/2031387636800303154"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#111111] underline decoration-[#EAEAEA] underline-offset-4 transition hover:text-[#1F6C9F]"
                  >
                    viral clips
                  </a>{" "}
                  and add to it.
                </p>
              </div>
            </div>
          </header>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1.02fr_1fr] lg:gap-5">
          <Reveal index={1}>
            <section className="rounded-xl border border-[#EAEAEA] bg-[#F9F9F8] p-3 sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#787774]">
                    Input
                  </p>
                  <h2 className="mt-1 text-lg font-medium tracking-[-0.03em] text-[#111111] sm:text-xl">
                    Drop the tweet
                  </h2>
                </div>
              </div>

              <div className="rounded-xl border border-[#EAEAEA] bg-white p-3.5 sm:p-4">
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
                  className="w-full resize-none rounded-lg border border-[#EAEAEA] bg-[#FBFBFA] px-3.5 py-3 text-[14px] leading-6 text-[#111111] outline-none transition placeholder:text-[#A3A3A0] focus:border-[#111111] sm:px-4 sm:text-[15px] sm:leading-7"
                />

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => void generate()}
                    disabled={loading}
                    className="rounded-md bg-[#111111] px-5 py-3 text-sm text-white transition hover:bg-[#2F3437] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Generating Bangers" : "Banger it"}
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

              {loading ? (
                <div>
                  <div className="mb-3 rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] px-4 py-3 text-[12px] leading-5 text-[#787774] sm:text-[13px] sm:leading-6">
                    Generating Bangers
                  </div>
                  <LoadingDrafts />
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#EAEAEA] bg-[#FBFBFA] p-4 text-[12px] leading-5 text-[#787774] sm:text-[13px] sm:leading-6">
                  Run the generator and three drafts will land here.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((text, index) => (
                    <Reveal key={`${index}-${text}`} index={index + 3}>
                      <article className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-3.5 sm:p-4">
                        <div className="flex items-start gap-3">
                          <span className="rounded-md bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#787774] border border-[#EAEAEA]">
                            0{index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDraftIndex((current) =>
                                  current === index ? null : index,
                                )
                              }
                              className="w-full text-left"
                            >
                              <p
                                className={`break-words text-[13px] leading-5 text-[#2F3437] sm:text-[15px] sm:leading-7 ${
                                  expandedDraftIndex === index ? "whitespace-pre-wrap" : "line-clamp-3"
                                }`}
                              >
                                {text}
                              </p>
                              <span className="mt-2 inline-flex text-[11px] uppercase tracking-[0.12em] text-[#787774]">
                                {expandedDraftIndex === index ? "Hide draft" : "Open draft"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
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

        <footer className="mt-5 px-1 pb-2 text-[12px] leading-6 text-[#787774] sm:mt-6 sm:text-[13px]">
          Built by{" "}
          <a
            href="https://x.com/pelz0x"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#111111] underline decoration-[#EAEAEA] underline-offset-4 transition hover:text-[#1F6C9F]"
          >
            Pelz
          </a>
          {" "} 
          <span className="text-[#B7B5B0]">•</span>
          {" "}Inspired by{" "}
          <a
            href="https://x.com/TukiFromTL"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#111111] underline decoration-[#EAEAEA] underline-offset-4 transition hover:text-[#9F2F2D]"
          >
            Tuki
          </a>
        </footer>
      </main>

    </div>
  );
}
