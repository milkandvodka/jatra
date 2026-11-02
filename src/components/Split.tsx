import type { ElementType } from "react";

/** A short heading (one to three words) whose characters rise from behind their baseline once it enters. */
export default function Split({ text, as: Tag = "h2", className, id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  let c = 0;
  return (
    <Tag className={className} id={id} data-split="" aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden="true">
          <span className="wd">
            {[...word].map((ch, i) => (
              <span key={i} className="ch" style={{ ["--c" as string]: c++ }}>
                {ch}
              </span>
            ))}
          </span>
          {w < text.split(" ").length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
