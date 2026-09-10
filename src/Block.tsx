import { useEffect, useRef } from "react";
import type { BlockDef } from "./blocks";

type Props = {
  def: BlockDef;
  value: string;
  onChange: (value: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
};

export function Block({ def, value, onChange, focused, onFocus, onBlur }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea to fit its content so nothing is hidden behind a scrollbar.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div
      className={`block block--${def.area}${focused ? " is-focused" : ""}`}
      style={{ gridArea: def.area }}
    >
      <label className="block__label" htmlFor={def.id}>
        {def.n && <span className="block__n">{def.n}</span>}
        <span className="block__title">{def.title}</span>
      </label>
      <p className="block__hint">{def.hint}</p>
      <textarea
        id={def.id}
        ref={ref}
        className="block__input"
        value={value}
        placeholder={def.placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        spellCheck
      />
    </div>
  );
}
