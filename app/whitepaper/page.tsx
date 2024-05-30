import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { WhitepaperPageContent } from "@/components/perturb/WhitepaperPageContent";

export const metadata: Metadata = {
  title: "Whitepaper — Perturb",
  description:
    "Read the Perturb whitepaper on decentralized adversarial robustness for production AI.",
  openGraph: {
    title: "Perturb Whitepaper — Decentralized AI Robustness",
    description:
      "Technical deep-dive into the Perturb subnet architecture, incentive design, and adversarial methodology.",
  },
};

export default function WhitepaperPage() {
  const htmlPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    "Perturb_Whitepaper.html"
  );
  const rawHtml = fs.readFileSync(htmlPath, "utf-8");

  // Extract content inside <body>...</body>
  const bodyMatch = rawHtml.match(/<body>([\s\S]*?)<\/body>/);
  let bodyContent = bodyMatch ? bodyMatch[1] : "";

  // Strip <script> blocks — sidebar observer is re-implemented via useEffect
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/g, "");

  // Inject download button into the sidebar nav (before the Contents label)
  bodyContent = bodyContent.replace(
    '<div class="nav-label">Contents</div>',
    `<a href="/downloads/Perturb_Whitepaper.html" download class="nav-download">↓&nbsp;&nbsp;Download</a>
  <div class="nav-label">Contents</div>`
  );

  return <WhitepaperPageContent htmlContent={bodyContent} />;
}
