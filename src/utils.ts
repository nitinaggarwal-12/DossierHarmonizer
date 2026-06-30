import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge class names safely with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple, robust, high-fidelity markdown parser to avoid React 19 peer-dependency issues
export function renderMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML characters to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Handle tables (very common in pharmaceutical dossiers)
  const lines = html.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // It's a table row
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        // Skip next line if it is a separator line (e.g. |---|---|)
        if (i + 1 < lines.length && lines[i + 1].trim().includes('---')) {
          i++;
        }
      } else {
        tableRows.push(cells);
      }
      lines[i] = ''; // Mark line as processed
    } else {
      if (inTable) {
        // Output compiled table
        const tableHTML = `
          <div class="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
            <table class="min-w-full divide-y divide-slate-200 font-sans text-sm text-slate-700">
              <thead class="bg-slate-50 text-slate-800 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  ${tableHeaders.map(h => `<th class="px-4 py-3 text-left border-b border-slate-200">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                ${tableRows.map((row, rIdx) => `
                  <tr class="${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-emerald-50/20 transition-colors">
                    ${row.map(c => {
                      const isBold = c.startsWith('**') && c.endsWith('**');
                      const cellText = isBold ? `<strong>${c.replace(/\*\*/g, '')}</strong>` : c;
                      return `<td class="px-4 py-3 border-b border-slate-100">${cellText}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        lines[i - tableRows.length - 2] = tableHTML;
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }
  }

  // Filter out the lines we replaced with empty
  html = lines.filter(l => l !== '').join('\n');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-md font-bold text-slate-900 mt-5 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-1">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-extrabold text-slate-950 mt-8 mb-4">$1</h2>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');

  // Unordered list items with bullet styling
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 pl-1 my-1.5 text-slate-700">$1</li>');
  
  // Wrap li sequences in ul
  // Matches any sequence of <li> elements
  html = html.replace(/(<li class="list-disc.*<\/li>)/gs, '<ul class="my-4 space-y-1">$1</ul>');

  // Numbered list items
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="list-decimal ml-5 pl-1 my-1.5 text-slate-700">$1</li>');
  html = html.replace(/(<li class="list-decimal.*<\/li>)/gs, '<ol class="my-4 space-y-1">$1</ol>');

  // Paragraphs (if line doesn't start with heading or list tags)
  const paragraphLines = html.split('\n');
  for (let j = 0; j < paragraphLines.length; j++) {
    const pl = paragraphLines[j].trim();
    if (pl && !pl.startsWith('<h') && !pl.startsWith('<u') && !pl.startsWith('<o') && !pl.startsWith('<l') && !pl.startsWith('<d') && !pl.startsWith('<t')) {
      paragraphLines[j] = `<p class="my-3 text-slate-700 leading-relaxed">${pl}</p>`;
    }
  }
  html = paragraphLines.join('\n');

  return html;
}
