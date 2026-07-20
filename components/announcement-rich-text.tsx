"use client";

import {
  useCallback,
  useRef,
  type ChangeEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

function wrapRange(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string
): { next: string; selStart: number; selEnd: number } {
  const selected = value.slice(start, end);
  const inner = selected.length > 0 ? selected : "text";
  const next = value.slice(0, start) + before + inner + after + value.slice(end);
  const selStart = start + before.length;
  const selEnd = selStart + inner.length;
  return { next, selStart, selEnd };
}

export function AnnouncementRichEditor({
  value,
  onChange,
  rows = 8,
  placeholder,
  disabled,
  className = "",
  id,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyWrap = useCallback(
    (before: string, after: string) => {
      const el = ref.current;
      if (!el || disabled) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const { next, selStart, selEnd } = wrapRange(value, start, end, before, after);
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      });
    },
    [disabled, onChange, value]
  );

  const applyLink = useCallback(() => {
    const el = ref.current;
    if (!el || disabled) return;
    const raw = window.prompt("URL odkazu (https://…)", "https://");
    if (raw == null) return;
    const url = raw.trim();
    if (!url) return;
    const safe = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const label = selected.length > 0 ? selected : "odkaz";
    const inserted = `[${label}](${safe})`;
    const next = value.slice(0, start) + inserted + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + inserted.length;
      el.setSelectionRange(cursor, cursor);
    });
  }, [disabled, onChange, value]);

  const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const btn =
    "rounded-md border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-[#39FF14]/40 hover:text-[#39FF14] disabled:opacity-50";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={disabled}
          title="Tučné — označ text a klikni"
          onClick={() => applyWrap("**", "**")}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          className={btn}
          disabled={disabled}
          title="Kurzíva — označ text a klikni"
          onClick={() => applyWrap("*", "*")}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          className={btn}
          disabled={disabled}
          title="Odkaz — označ text a vlož URL"
          onClick={applyLink}
        >
          Odkaz
        </button>
        <span className="text-[11px] text-slate-500">
          Označ část textu → tučné / kurzíva / odkaz
        </span>
      </div>
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={onTextChange}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={
          className ||
          "w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600"
        }
      />
    </div>
  );
}

/** Vykreslí **tučné**, *kurzíva* a [text](url). */
export function AnnouncementRichText({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}): ReactNode {
  return <div className={className}>{renderRichInline(content)}</div>;
}

function renderRichInline(input: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = input.split("\n");

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) nodes.push(<br key={`br-${lineIdx}`} />);
    nodes.push(...tokenizeLine(line, `l${lineIdx}`));
  });

  return nodes;
}

function tokenizeLine(line: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // [label](url) | **bold** | *italic*
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(<span key={`${keyPrefix}-t${i++}`}>{line.slice(last, m.index)}</span>);
    }
    if (m[1] != null && m[2] != null) {
      nodes.push(
        <a
          key={`${keyPrefix}-a${i++}`}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#39FF14] underline underline-offset-2 hover:text-[#6dff4a]"
        >
          {m[1]}
        </a>
      );
    } else if (m[3] != null) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-bold text-white">
          {m[3]}
        </strong>
      );
    } else if (m[4] != null) {
      nodes.push(
        <em key={`${keyPrefix}-i${i++}`} className="italic text-slate-100">
          {m[4]}
        </em>
      );
    }
    last = m.index + m[0].length;
  }

  if (last < line.length) {
    nodes.push(<span key={`${keyPrefix}-t${i++}`}>{line.slice(last)}</span>);
  }

  if (nodes.length === 0) {
    nodes.push(<span key={`${keyPrefix}-empty`}>{"\u00A0"}</span>);
  }

  return nodes;
}

// silence unused import if TextareaHTMLAttributes was planned
void 0 as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>;
