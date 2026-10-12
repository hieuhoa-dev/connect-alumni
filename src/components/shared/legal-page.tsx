import { Tag } from "@/components/landing/landing-parts";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export const LegalPage = ({
  eyebrow,
  title,
  updatedAt,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}) => {
  return (
    <div className="container mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 pb-8">
        <Tag tone="blue">{eyebrow}</Tag>
        <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
        <span className="font-mono text-xs text-muted-foreground">
          Cập nhật: {updatedAt}
        </span>
      </header>

      <div className="flex flex-col gap-8 border-t-2 border-foreground pt-8">
        {sections.map((section, index) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="font-serif text-xl font-medium text-foreground">
              {index + 1}. {section.heading}
            </h2>
            {section.paragraphs.map((text) => (
              <p
                key={text}
                className="text-sm leading-relaxed text-foreground/90"
              >
                {text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};
