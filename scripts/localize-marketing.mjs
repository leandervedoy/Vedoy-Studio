// One-time syntax-aware migration; already migrated files are skipped.
import fs from 'node:fs';
import ts from 'typescript';
const files = [
  ['app/(marketing)/page.tsx', 'server', 'HomePage'],
  ['components/product-grid.tsx', 'client', 'ProductGrid'],
];
for (const [file, environment, component] of files) {
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes('@/i18n/')) continue;
  if (component === 'HomePage') {
    source = source.replace(/^function Header\(\).*?\r?\n/m, '');
    source = 'import { MarketingHeader } from "@/components/marketing-header";\nimport { AnimatedStats } from "@/components/animated-stats";\n' + source;
    source = source.replace('<Header />', '<MarketingHeader initialProfile={session ? { name: session.name, avatarUrl: session.avatarUrl } : null} />');
    source = source.replace('  <section className="intro-section">', '  <AnimatedStats projects={projects.filter(project => project.published).length} services={studioServices.filter(service => service.slug !== "ecommerce" && service.published !== false).length} />\n  <section className="intro-section">');
    source = source.replaceAll('{ number:', '{ published: true, number:');
  }
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  function visit(node) {
    if (ts.isJsxText(node) && /[a-zæøå]/i.test(node.text)) {
      const value = node.text.trim();
      edits.push([node.pos, node.end, `${/^\s/.test(node.text) ? ' ' : ''}{c(${JSON.stringify(value)})}${/\s$/.test(node.text) ? ' ' : ''}`]);
    }
    if (ts.isJsxAttribute(node) && ['aria-label', 'placeholder', 'title'].includes(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) {
      edits.push([node.initializer.getStart(ast), node.initializer.end, `{c(${JSON.stringify(node.initializer.text)})}`]);
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === component) {
      edits.push([node.body.getStart(ast) + 1, node.body.getStart(ast) + 1, `\n  const c = ${environment === 'server' ? 'await getCopy()' : 'useCopy()'};\n`]);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const [start, end, value] of edits.sort((a,b) => b[0] - a[0])) source = source.slice(0,start) + value + source.slice(end);
  const translationImport = environment === 'server' ? 'import { getCopy } from "@/i18n/server";\n' : 'import { useCopy } from "@/i18n/use-copy";\n';
  source = source.startsWith('"use client";') ? source.replace('"use client";', '"use client";\n' + translationImport) : translationImport + source;
  const expressions = component === 'HomePage' ? ['service.title', 'service.cardText', 'project.text', 'title', 'text'] : component === 'ProductGrid' ? ['group', 'product.name', 'product.description', 'highlight', 'statusLabels[product.status]', 'actionLabels[product.status]'] : [];
  for (const expression of expressions) source = source.replaceAll(`{${expression}}`, `{c(${expression})}`);
  if (component === 'HomePage') {
    source = source.replace('{service.slug === "ecommerce" ? "DEMO" : "BESTILL NÅ"}', '{c(service.slug === "ecommerce" ? "DEMO" : "BESTILL NÅ")}');
    source = source.replace('{service.slug === "hosting-og-domene" ? "Åpne side og bestilling →" : "Åpne tjenesteside →"}', '{c(service.slug === "hosting-og-domene" ? "Åpne side og bestilling →" : "Åpne tjenesteside →")}');
  }
  if (component === 'ContactForm' || component === 'ProductCustomizer') {
    source = source.replace(/set(Message|SubmitMessage|UploadMessage)\(("[^"\n]*")\)/g, 'set$1(c($2))');
    source = source.replaceAll('result.error || "Noe gikk galt."', 'c(result.error || "Noe gikk galt.")');
    source = source.replaceAll('? "Lagrer …" : "Send forespørsel →"', '? c("Lagrer …") : c("Send forespørsel →")');
  }
  if (component === 'ProductCustomizer') source = source.replace('logo ? "Bytt logo" : "Last opp logo"', 'logo ? c("Bytt logo") : c("Last opp logo")');
  fs.writeFileSync(file, source);
}
