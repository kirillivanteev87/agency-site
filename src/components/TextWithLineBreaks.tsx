import { Fragment, type ReactNode } from "react";
import { splitTextLines } from "@/lib/text-line-breaks";

export function TextWithLineBreaks({ text }: { text: string }): ReactNode {
  const lines = splitTextLines(text);
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}
