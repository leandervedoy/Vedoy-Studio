import styles from "./article-sections.module.css";

/**
 * Vedøy Design: reusable, accessible article blocks for Vedoy Insights, VeDo
 * and other Vedøy publications. Content stays declarative and presentation
 * stays in a single shared component library.
 */
export type ArticleSectionKind = "text" | "highlight" | "quote" | "sources" | "faq";

export type ArticleSectionData = {
  heading: string;
  paragraphs: ReadonlyArray<string>;
  kind?: ArticleSectionKind;
  points?: ReadonlyArray<string>;
  sources?: ReadonlyArray<{ label: string; href: string }>;
  questions?: ReadonlyArray<{ question: string; answer: string }>;
};

export type ArticleSectionsProps = {
  sections: ReadonlyArray<ArticleSectionData>;
  paragraphLimit?: number;
  numbered?: boolean;
};

function safeSourceUrl(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//")
    || /^https:\/\/[^\s]+$/i.test(href);
}

function SectionParagraphs({
  paragraphs,
  limit,
}: {
  paragraphs: ReadonlyArray<string>;
  limit: number;
}) {
  return (
    <>
      {paragraphs.slice(0, limit).map((paragraph, index) => (
        <p key={index} className={styles.paragraph}>{paragraph}</p>
      ))}
    </>
  );
}

export function ArticleSection({
  section,
  index,
  paragraphLimit = Number.POSITIVE_INFINITY,
  numbered = true,
}: {
  section: ArticleSectionData;
  index: number;
  paragraphLimit?: number;
  numbered?: boolean;
}) {
  const id = `vedoy-article-section-${index + 1}`;
  const isQuote = section.kind === "quote";
  const isHighlight = section.kind === "highlight";

  return (
    <section className={styles.section} aria-labelledby={id}>
      {numbered ? (
        <span className={styles.chapterNumber} aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
      <div className={styles.content}>
        <h2 id={id} className={styles.heading}>{section.heading}</h2>
        {isQuote ? (
          <blockquote className={styles.quote}>
            <SectionParagraphs paragraphs={section.paragraphs} limit={paragraphLimit} />
          </blockquote>
        ) : isHighlight ? (
          <aside className={styles.highlight} aria-label={section.heading}>
            <SectionParagraphs paragraphs={section.paragraphs} limit={paragraphLimit} />
            {section.points?.length ? (
              <ul className={styles.points}>{section.points.map((point, i) => <li key={i}>{point}</li>)}</ul>
            ) : null}
          </aside>
        ) : (
          <SectionParagraphs paragraphs={section.paragraphs} limit={paragraphLimit} />
        )}

        {section.kind !== "highlight" && section.points?.length ? (
          <ul className={styles.points}>{section.points.map((point, i) => <li key={i}>{point}</li>)}</ul>
        ) : null}

        {section.kind === "faq" && section.questions?.length ? (
          <div className={styles.questions}>
            {section.questions.map((item, i) => (
              <details className={styles.question} key={i}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        ) : null}

        {section.sources?.length ? (
          <ul className={styles.sources} aria-label="Kilder og videre lesning">
            {section.sources.filter(source => safeSourceUrl(source.href)).map((source, i) => (
              <li key={i}>
                <a href={source.href} {...(source.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function ArticleSections({
  sections,
  paragraphLimit = Number.POSITIVE_INFINITY,
  numbered = true,
}: ArticleSectionsProps) {
  return (
    <div className={styles.articleSections}>
      {sections.map((section, index) => (
        <ArticleSection
          key={`${index}-${section.heading}`}
          section={section}
          index={index}
          paragraphLimit={paragraphLimit}
          numbered={numbered}
        />
      ))}
    </div>
  );
}
