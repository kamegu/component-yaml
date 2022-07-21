import React, {useRef} from "react";
import mermaid from "mermaid";

// mermaid.initialize({
//   startOnLoad: true,
//   theme: "default",
//   fontFamily: "Fira Code"
// });

export default function Mermaid({chart}) {
  const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
  const randomRef = useRef('random'+ randomid())

  const rawSvg = mermaid.render(randomRef.current, chart)

  return <>
    <div dangerouslySetInnerHTML={{__html: rawSvg}}/>
    </>;
}