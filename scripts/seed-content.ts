import { ensureFile } from "./world-utils.js";

interface SkillSeed {
  readonly domain: "coding" | "research" | "summarization";
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly body: string;
  readonly inspiredBy: readonly string[];
}

const superpowers = "https://github.com/obra/superpowers";
const gstack = "https://github.com/garrytan/gstack";

const skills: readonly SkillSeed[] = [
  {
    domain: "coding",
    slug: "inspect-before-edit",
    name: "Inspect Before Edit",
    description: "Read relevant files and local conventions before changing code.",
    body: "Before editing, inspect the nearest code, tests, package scripts, and agent guidance. Name the files you used as evidence.",
    inspiredBy: [superpowers],
  },
  {
    domain: "coding",
    slug: "red-green-refactor",
    name: "Red Green Refactor",
    description: "Use a failing test before production code for behavior changes.",
    body: "Write the smallest test that should fail, run it, implement the smallest change, run it again, then refactor only while green.",
    inspiredBy: [superpowers],
  },
  {
    domain: "coding",
    slug: "small-diff-commits",
    name: "Small Diff Commits",
    description: "Keep implementation slices reviewable and independently verifiable.",
    body: "Group changes by behavior, not by file type. Verify each slice before moving to the next.",
    inspiredBy: [superpowers],
  },
  {
    domain: "coding",
    slug: "typed-boundaries",
    name: "Typed Boundaries",
    description: "Make package and I/O boundaries explicit with types.",
    body: "Use discriminated unions and readonly interfaces at boundaries. Convert unknown inputs at the edge.",
    inspiredBy: [],
  },
  {
    domain: "coding",
    slug: "no-io-in-core",
    name: "No I/O In Core",
    description: "Keep pure core packages free of filesystem, network, and process effects.",
    body: "If code reads files, calls APIs, shells out, or touches time, place it outside core and inject the result.",
    inspiredBy: [],
  },
  {
    domain: "coding",
    slug: "validate-tool-output",
    name: "Validate Tool Output",
    description: "Check command output and exit status before making claims.",
    body: "Read fresh output, confirm exit status, and map the result to the requirement being verified.",
    inspiredBy: [superpowers],
  },
  {
    domain: "coding",
    slug: "recover-from-failure",
    name: "Recover From Failure",
    description: "When a command fails, identify root cause before changing implementation.",
    body: "Classify failure as environment, missing dependency, broken expectation, or implementation bug before fixing.",
    inspiredBy: [superpowers],
  },
  {
    domain: "coding",
    slug: "world-search-before-work",
    name: "World Search Before Work",
    description: "Search shared skills, traces, and anti-patterns before beginning unfamiliar work.",
    body: "Load only relevant artifacts and cite which ones influenced the plan.",
    inspiredBy: [superpowers],
  },
  {
    domain: "coding",
    slug: "conventional-commits",
    name: "Conventional Commits",
    description: "Use terse conventional commit messages that describe behavior.",
    body: "Prefer feat, fix, test, docs, refactor, chore. Keep one behavior per commit.",
    inspiredBy: [],
  },
  {
    domain: "coding",
    slug: "review-findings-first",
    name: "Review Findings First",
    description: "Lead code reviews with bugs and risks, then summaries.",
    body: "Order findings by severity with file references. Keep praise and broad summaries secondary.",
    inspiredBy: [gstack],
  },
  {
    domain: "research",
    slug: "source-triangulation",
    name: "Source Triangulation",
    description: "Compare multiple independent sources before treating a claim as settled.",
    body: "Use primary sources first, then corroborating secondary sources. Mark conflicts explicitly.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "quote-limit-discipline",
    name: "Quote Limit Discipline",
    description: "Use short quotes only when exact wording matters.",
    body: "Paraphrase by default and reserve direct quotes for definitions, claims, or terms of art.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "primary-source-first",
    name: "Primary Source First",
    description: "Prefer papers, docs, statutes, transcripts, filings, and official pages.",
    body: "Search for original evidence before relying on summaries or social posts.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "freshness-check",
    name: "Freshness Check",
    description: "Verify time-sensitive facts against current sources.",
    body: "For people, prices, rules, releases, and schedules, check current sources and state exact dates.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "evidence-led-summary",
    name: "Evidence Led Summary",
    description: "Summarize from evidence, not from a remembered conclusion.",
    body: "Collect claims with source anchors, then synthesize only what the evidence supports.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "claim-uncertainty-labels",
    name: "Claim Uncertainty Labels",
    description: "Mark inference, uncertainty, and source conflict visibly.",
    body: "Use labels such as verified, inferred, disputed, and unknown when certainty varies.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "citation-lineage",
    name: "Citation Lineage",
    description: "Track where a claim was learned and what depends on it.",
    body: "Record claim, source, date accessed, and downstream decisions that relied on it.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "query-decomposition",
    name: "Query Decomposition",
    description: "Split broad research into independently answerable questions.",
    body: "Break the request into entities, dates, claims, and decision criteria before searching.",
    inspiredBy: [gstack],
  },
  {
    domain: "research",
    slug: "contradiction-scan",
    name: "Contradiction Scan",
    description: "Actively search for disconfirming evidence.",
    body: "Before final synthesis, run targeted searches for opposing results, corrections, and stale assumptions.",
    inspiredBy: [],
  },
  {
    domain: "research",
    slug: "research-trace-authoring",
    name: "Research Trace Authoring",
    description: "Turn reusable research workflows into annotated traces.",
    body: "Capture the query path, key pivots, discarded sources, and why the final evidence was trusted.",
    inspiredBy: [superpowers],
  },
  {
    domain: "summarization",
    slug: "audience-first-brief",
    name: "Audience First Brief",
    description: "Shape summaries around audience decisions and constraints.",
    body: "Identify who is reading, what they must decide, and how much detail they can use.",
    inspiredBy: [],
  },
  {
    domain: "summarization",
    slug: "preserve-decisions",
    name: "Preserve Decisions",
    description: "Keep decisions, owners, and deadlines intact when compressing.",
    body: "Do not trade away commitments for prose polish.",
    inspiredBy: [],
  },
  {
    domain: "summarization",
    slug: "extract-action-items",
    name: "Extract Action Items",
    description: "Convert discussed work into clear owner/action/date records.",
    body: "Separate decisions from tasks and open questions.",
    inspiredBy: [gstack],
  },
  {
    domain: "summarization",
    slug: "provenance-first",
    name: "Provenance First",
    description: "Keep source links and artifact paths attached to summarized claims.",
    body: "Every non-obvious claim in a summary should map back to a source artifact.",
    inspiredBy: [],
  },
  {
    domain: "summarization",
    slug: "compress-without-omission",
    name: "Compress Without Omission",
    description: "Reduce length without dropping distinct requirements.",
    body: "Merge duplicate phrasing but preserve each unique constraint, blocker, command, and deliverable.",
    inspiredBy: [],
  },
  {
    domain: "summarization",
    slug: "compare-versions",
    name: "Compare Versions",
    description: "Summarize what changed across versions before summarizing the final state.",
    body: "Call out added, removed, changed, and unresolved points.",
    inspiredBy: [],
  },
  {
    domain: "summarization",
    slug: "synthesis-from-runs",
    name: "Synthesis From Runs",
    description: "Summarize repeated run evidence into reusable learning.",
    body: "Group patterns across runs and separate durable lessons from one-off context.",
    inspiredBy: [superpowers],
  },
  {
    domain: "summarization",
    slug: "structured-exec-summary",
    name: "Structured Executive Summary",
    description: "Lead with result, evidence, risk, and next action.",
    body: "Use compact sections only when they improve scanability.",
    inspiredBy: [gstack],
  },
  {
    domain: "summarization",
    slug: "anti-pattern-highlighting",
    name: "Anti-Pattern Highlighting",
    description: "Surface repeated failure modes in summaries.",
    body: "When summarizing retrospectives, name the anti-pattern and the safer replacement behavior.",
    inspiredBy: [],
  },
  {
    domain: "summarization",
    slug: "curriculum-progress-summary",
    name: "Curriculum Progress Summary",
    description: "Summarize learning path progress with evidence and next steps.",
    body: "Report completed steps, evidence artifacts, weak areas, and the next required exercise.",
    inspiredBy: [],
  },
];

const antiPatterns = [
  ["coding", "editing-before-reading", "Editing Before Reading", "Changing code before inspecting local conventions", "It creates style drift and misses existing helpers.", "Read nearby files and tests first."],
  ["coding", "passing-tests-proxy", "Passing Tests As Proxy", "Treating green tests as proof requirements are met", "Tests may not cover the explicit objective.", "Audit requirements against artifacts."],
  ["research", "secondary-source-loop", "Secondary Source Loop", "Citing summaries that cite other summaries", "The chain hides original evidence and errors.", "Find the primary source."],
  ["research", "stale-fact-reuse", "Stale Fact Reuse", "Answering current facts from memory", "Modern facts change frequently.", "Browse or verify exact dates."],
  ["summarization", "pretty-but-lossy", "Pretty But Lossy", "Making a summary elegant while dropping constraints", "Readers lose commitments and blockers.", "Preserve unique requirements before editing prose."],
  ["summarization", "action-owner-blur", "Action Owner Blur", "Combining actions without owners", "Tasks become unaccountable.", "Represent action, owner, and due date separately."],
] as const;

const traces = [
  ["coding", "repair-failing-typecheck", "Repair a failing typecheck from evidence"],
  ["coding", "add-tested-math-formula", "Add a math formula with red-green evidence"],
  ["research", "verify-current-api-fact", "Verify a current API fact from primary docs"],
  ["research", "resolve-conflicting-claims", "Resolve conflicting claims with source hierarchy"],
  ["summarization", "extract-meeting-actions", "Extract actions from a noisy meeting note"],
  ["summarization", "compress-roadmap", "Compress a roadmap without losing requirements"],
] as const;

const runs = [
  ["run-coding-001", "coding", "Add a failing test before a math implementation"],
  ["run-coding-002", "coding", "Audit a scaffold against a roadmap"],
  ["run-research-001", "research", "Find primary evidence for a release date"],
  ["run-research-002", "research", "Compare official docs with a blog summary"],
  ["run-summary-001", "summarization", "Summarize a long plan into tasks"],
  ["run-summary-002", "summarization", "Extract decisions and open questions"],
] as const;

const curricula = {
  coding: ["Inspect local context", "Write red-green tests", "Verify and review"],
  research: ["Decompose the question", "Collect primary evidence", "Synthesize with uncertainty"],
  summarization: ["Identify audience", "Preserve commitments", "Compress and audit"],
} as const;

for (const skill of skills) {
  const base = `domains/${skill.domain}/skills/${skill.slug}`;
  ensureFile(
    `${base}/SKILL.md`,
    `---\nid: ${skill.domain}.${skill.slug}\nname: ${skill.name}\ndescription: ${skill.description}\nkind: prompt\ndomains: [${skill.domain}]\nstatus: promoted\nvisibility: public\nversion: 1\n---\n\n# ${skill.name}\n\n${skill.body}\n\n## Steps\n\n1. Identify the reusable situation.\n2. Apply the behavior with local evidence.\n3. Record whether it helped.\n\n# Provenance\n\nSeeded during Phase 0 from goal.md. Inspired by: ${skill.inspiredBy.length === 0 ? "local roadmap" : skill.inspiredBy.join(", ")}.\n`,
  );
  ensureFile(`${base}/examples/001-input.md`, `# Input\n\nApply ${skill.name} to a representative ${skill.domain} task.\n`);
  ensureFile(`${base}/examples/001-output.md`, `# Output\n\nA concise artifact showing ${skill.description.toLowerCase()}\n`);
  ensureFile(`${base}/examples/001-meta.yaml`, `domain: ${skill.domain}\nskill: ${skill.domain}.${skill.slug}\n`);
  ensureFile(
    `${base}/lineage.json`,
    `${JSON.stringify({ id: `${skill.domain}.${skill.slug}`, inspired_by: skill.inspiredBy, competes_with: [] }, null, 2)}\n`,
  );
}

for (const [domain, slug, name, description, why, insteadDo] of antiPatterns) {
  ensureFile(
    `domains/${domain}/anti-patterns/${slug}/ANTI-PATTERN.md`,
    `---\nid: ${domain}.${slug}\nname: ${name}\ndomain: ${domain}\nvisibility: public\n---\n\n# ${name}\n\n## What Not To Do\n\n${description}.\n\n## Why\n\n${why}\n\n## Instead Do\n\n${insteadDo}\n`,
  );
}

for (const [domain, slug, title] of traces) {
  const base = `domains/${domain}/traces/${slug}`;
  ensureFile(
    `${base}/TRACE.md`,
    `---\nid: ${domain}.${slug}\ntitle: ${title}\ndomain: ${domain}\nvisibility: public\n---\n\n# Goal\n\n${title}.\n\n## Step 1 - Frame the task\n\nName the expected outcome and constraints.\n\n## Step 2 - Gather evidence\n\nUse the relevant skill, source, or command output.\n\n## Step 3 - Validate\n\nCheck the result against the original goal.\n\n## Common pitfalls\n\nSkipping the validation step.\n\n## Alternatives\n\nEscalate when evidence is missing.\n`,
  );
  ensureFile(
    `${base}/steps.jsonl`,
    `${JSON.stringify({ index: 1, action: "frame", annotation: "Name success before acting." })}\n${JSON.stringify({ index: 2, action: "gather evidence", annotation: "Prefer concrete artifacts." })}\n${JSON.stringify({ index: 3, action: "validate", annotation: "Compare against the goal." })}\n`,
  );
  ensureFile(`${base}/meta.yaml`, `domain: ${domain}\nteaches:\n  - ${title}\nvisibility: public\n`);
}

for (const [runId, domain, goal] of runs) {
  const base = `runs/${runId}`;
  ensureFile(
    `${base}/RUN.md`,
    `# Goal\n\n${goal}.\n\n# Plan\n\nUse the relevant seed skill, record prediction, execute, validate, and reflect.\n\n# Outcome\n\nSynthetic seed run for Phase 0 format validation.\n\n# Provenance\n\nHand-authored seed content.\n`,
  );
  ensureFile(
    `${base}/episodes.jsonl`,
    `${JSON.stringify({ kind: "run_start", domain, goal })}\n${JSON.stringify({ kind: "validation", passed: true, score: 0.8 })}\n${JSON.stringify({ kind: "run_end", success: true })}\n`,
  );
  ensureFile(`${base}/meta.yaml`, `id: ${runId}\ndomain: ${domain}\nvisibility: public\npublishable: true\n`);
}

for (const [domain, steps] of Object.entries(curricula)) {
  ensureFile(`domains/${domain}/README.md`, `# ${domain}\n\nSeed domain for ${domain} skills, traces, rubrics, exemplars, and anti-patterns.\n`);
  ensureFile(
    `domains/${domain}/curriculum.md`,
    `# ${domain} Curriculum\n\n${steps
      .map((step, index) => `${index + 1}. **${step}** - Complete one starter goal and record evidence.`)
      .join("\n")}\n`,
  );
  ensureFile(`domains/${domain}/rubrics/baseline.md`, `# ${domain} Baseline Rubric\n\n- Evidence is concrete.\n- Output maps to the goal.\n- Risks and uncertainty are explicit.\n`);
  ensureFile(`domains/${domain}/exemplars/baseline/output.md`, `# ${domain} Exemplar\n\nA compact, evidence-led output for the ${domain} starter curriculum.\n`);
  ensureFile(`domains/${domain}/exemplars/baseline/meta.yaml`, `domain: ${domain}\nkind: exemplar\n`);
}

ensureFile(
  "contributors/maintainer.json",
  `${JSON.stringify(
    {
      handle: "maintainer",
      firstContribution: "2026-05-09",
      domains: ["coding", "research", "summarization"],
      contributions: { skills: 30, antiPatterns: 6, traces: 6, runsPublished: 6, skillsArchived: 0 },
      trustScore: 0.75,
      domainTrust: { coding: 0.75, research: 0.75, summarization: 0.75 },
    },
    null,
    2,
  )}\n`,
);

ensureFile("featured/README.md", "# Featured\n\nMaintainer-curated current and archived picks.\n");
ensureFile("featured/current.md", "# Current Featured Picks\n\n- coding.inspect-before-edit\n- research.primary-source-first\n- summarization.preserve-decisions\n");
ensureFile("featured/archive/2026-19.md", "# Featured Archive 2026-W19\n\nInitial seed archive.\n");
ensureFile("proposals/README.md", "# Proposals\n\nPR queue and design proposals are mirrored here when useful.\n");
ensureFile("retired/README.md", "# Retired\n\nArchived artifacts keep lineage and provenance.\n");

console.log(`seeded ${skills.length} skills, ${antiPatterns.length} anti-patterns, ${traces.length} traces, ${runs.length} runs`);
