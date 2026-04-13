import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.resolve(__dirname, '../../awesome-nano-banana-pro-prompts-main/README.md');
const OUTPUT_PATH = path.resolve(__dirname, '../public/prompts.json');

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  author: { name: string; link?: string };
  language: string;
  featured: boolean;
  categories: string[];
  youmindId?: string;
}

function parseReadme(text: string): Prompt[] {
  const prompts: Prompt[] = [];

  // Split by prompt headings: "### No. N:"
  const sections = text.split(/(?=^### No\. \d+:)/m);

  for (const section of sections) {
    if (!section.trim().startsWith('### No.')) continue;

    // --- Title ---
    const titleMatch = section.match(/^### No\. \d+: (.+)$/m);
    if (!titleMatch) continue;
    const fullTitle = titleMatch[1].trim();

    // --- Featured ---
    const featured = /!\[Featured\]/.test(section);

    // --- Language ---
    const langMatch = section.match(/!\[Language-([A-Z]{2})\]/);
    const language = langMatch ? langMatch[1].toLowerCase() : 'en';

    // --- Description ---
    const descMatch = section.match(/#### 📖 Description\s+([\s\S]+?)(?=####|\n---)/);
    const description = descMatch ? descMatch[1].trim() : '';

    // --- Prompt content (inside code block) ---
    const promptMatch = section.match(/#### 📝 Prompt\s+```\s*([\s\S]+?)```/);
    if (!promptMatch) continue;
    const content = promptMatch[1].trim();

    // --- Images ---
    const imageMatches = [...section.matchAll(/<img src="(https?:\/\/[^"]+)"/g)];
    const images = imageMatches.map(m => m[1]);
    if (images.length === 0) continue; // skip prompts with no images

    // --- Author ---
    const authorLinkMatch = section.match(/\*\*Author:\*\* \[([^\]]+)\]\(([^)]+)\)/);
    const authorPlainMatch = section.match(/\*\*Author:\*\* ([^\n\[]+)/);
    let author: { name: string; link?: string };
    if (authorLinkMatch) {
      author = { name: authorLinkMatch[1].trim(), link: authorLinkMatch[2].trim() };
    } else if (authorPlainMatch) {
      author = { name: authorPlainMatch[1].trim() };
    } else {
      author = { name: 'Unknown' };
    }

    // --- YouMind ID from "Try it now" link ---
    const idMatch = section.match(/\?id=(\d+)/);
    const youmindId = idMatch ? idMatch[1] : undefined;

    // --- Categories from title prefix (e.g. "Profile / Avatar - My Title") ---
    const categories: string[] = [];
    const catSeparatorIdx = fullTitle.indexOf(' - ');
    let title = fullTitle;
    if (catSeparatorIdx !== -1) {
      const catPart = fullTitle.substring(0, catSeparatorIdx).trim();
      title = fullTitle.substring(catSeparatorIdx + 3).trim();
      // Keep the full category as-is (e.g. "Profile / Avatar" stays as one category)
      if (catPart) categories.push(catPart);
    }

    const id = youmindId ?? `${prompts.length + 1}`;

    prompts.push({
      id,
      title,
      description,
      content,
      images,
      author,
      language,
      featured,
      categories,
      youmindId,
    });
  }

  return prompts;
}

const readmeText = fs.readFileSync(README_PATH, 'utf-8');
console.log(`📖 Read README.md (${(readmeText.length / 1024).toFixed(0)} KB)`);

const prompts = parseReadme(readmeText);
console.log(`✅ Parsed ${prompts.length} prompts`);
console.log(`⭐ Featured: ${prompts.filter(p => p.featured).length}`);

// Collect all unique categories
const allCategories = [...new Set(prompts.flatMap(p => p.categories))].sort();
console.log(`🏷️  Categories (${allCategories.length}): ${allCategories.slice(0, 10).join(', ')}...`);

const output = { prompts, categories: allCategories, total: prompts.length };
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
console.log(`💾 Written to ${OUTPUT_PATH}`);
