import { useState, useRef } from "react";
import { Copy, Check, Loader2 } from "lucide-react";

const CATEGORIES = [
  {
    id: "ai-jobs",
    label: "AI & Jobs",
    description: "AI Disruption, Automation, and Job/Startup Replacement Ironies",
    systemPrompt: `You are a sharp, sardonic Twitter commentator. Generate 3 quote tweets for the given tweet. Focus on irony around AI disruption, automation replacing jobs, and startup founders being automated out of existence. Each quote tweet should be punchy, under 280 characters, and drip with dark irony. Number them 1, 2, 3. Output ONLY the 3 quote tweets, each on its own line starting with the number and a period.`,
  },
  {
    id: "market-games",
    label: "Market Games",
    description: "Insider Trading, Market Manipulation, and Geopolitical Timing Tricks",
    systemPrompt: `You are a sharp, sardonic Twitter commentator. Generate 3 quote tweets for the given tweet. Focus on irony around insider trading, market manipulation, suspicious timing of geopolitical events coinciding with stock moves, and the theater of financial regulation. Each quote tweet should be punchy, under 280 characters, and drip with dark irony. Number them 1, 2, 3. Output ONLY the 3 quote tweets, each on its own line starting with the number and a period.`,
  },
  {
    id: "ceo-clowns",
    label: "CEO Clowns",
    description: "Corporate Hypocrisy, CEO Flip-Flops, and Elite Contradictions",
    systemPrompt: `You are a sharp, sardonic Twitter commentator. Generate 3 quote tweets for the given tweet. Focus on corporate hypocrisy, CEO flip-flops, elite contradictions — the gap between what powerful people say and what they do. Each quote tweet should be punchy, under 280 characters, and drip with dark irony. Number them 1, 2, 3. Output ONLY the 3 quote tweets, each on its own line starting with the number and a period.`,
  },
];

function parseResponses(raw: string): string[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const results: string[] = [];
  for (const line of lines) {
    const match = line.match(/^[123][.)]\s*(.+)/);
    if (match) {
      results.push(match[1].trim());
    }
  }
  if (results.length === 3) return results;
  return lines.slice(0, 3).map((l) => l.replace(/^[123][.)]\s*/, "").trim());
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 border transition-all ${
        copied
          ? "border-white/20 text-white bg-white/10"
          : "border-[hsl(0_0%_18%)] text-[hsl(0_0%_55%)] hover:border-white/30 hover:text-white"
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function App() {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [tweet, setTweet] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function generate() {
    if (!tweet.trim()) return;

    const cat = CATEGORIES.find((c) => c.id === category)!;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "openai",
          private: true,
          messages: [
            { role: "system", content: cat.systemPrompt },
            { role: "user", content: `Tweet to quote:\n\n${tweet.trim()}` },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} — try again`);
      }

      const raw = await response.text();
      const parsed = parseResponses(raw);
      setResults(parsed.length ? parsed : [raw]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      generate();
    }
  }

  const activeCategory = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_5%)] text-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight leading-none">
            Tweet Bangers
          </h1>
        </div>

        {/* Category buttons */}
        <div className="flex gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-1 py-2 text-sm font-semibold border transition-all ${
                category === cat.id
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-[hsl(0_0%_50%)] border-[hsl(0_0%_16%)] hover:text-white hover:border-[hsl(0_0%_30%)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category description */}
        <p className="text-xs text-[hsl(0_0%_38%)] mb-5 font-mono">
          {activeCategory.description}
        </p>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the tweet"
          rows={5}
          className="w-full bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_14%)] text-white text-sm px-4 py-3.5 outline-none focus:border-[hsl(0_0%_28%)] transition-colors resize-none placeholder:text-[hsl(0_0%_28%)] leading-relaxed mb-3"
        />

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || !tweet.trim()}
          className="w-full bg-white text-black text-sm font-bold py-3 hover:bg-[hsl(0_0%_88%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating...
            </>
          ) : (
            "Banger it"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8 flex flex-col gap-4">
            {results.map((text, i) => (
              <div
                key={i}
                className="border border-[hsl(0_0%_14%)] bg-[hsl(0_0%_8%)] px-5 py-4"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-[hsl(0_0%_28%)] font-black text-lg leading-none shrink-0 mt-0.5 select-none">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-[hsl(0_0%_90%)]">
                    {text}
                  </p>
                </div>
                <div className="flex justify-end">
                  <CopyButton text={text} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-12 mt-16">
        <p className="text-xs text-[hsl(0_0%_28%)]">
          built by{" "}
          <a
            href="https://twitter.com/pelz0x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold hover:text-[hsl(0_0%_70%)] transition-colors"
          >
            Pelz
          </a>
        </p>
        <p className="text-xs text-[hsl(0_0%_28%)]">
          inspired by{" "}
          <a
            href="https://twitter.com/tukifromKL"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold hover:text-[hsl(0_0%_70%)] transition-colors"
          >
            Tuki
          </a>
        </p>
      </div>
    </div>
  );
}
