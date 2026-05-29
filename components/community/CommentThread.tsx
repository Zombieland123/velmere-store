"use client";

import { useState } from "react";
import LiveTimestamp from "@/components/ui/LiveTimestamp";
import { ChevronDown, MoreVertical, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import type { SquareComment } from "@/lib/square/types";

type CommentThreadProps = {
  comments: SquareComment[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  labels: {
    title: string;
    placeholder: string;
    post: string;
    reply: string;
    replies: string;
    empty: string;
  };
};

const fallbackComments = [
  {
    id: "seed-archive",
    authorName: "Archive Reader",
    body: "The archive access idea feels clean. Keep VLM access-first, not finance-first.",
    createdAt: "Pinned",
    moderationStatus: "approved" as const,
  },
  {
    id: "seed-fit",
    authorName: "Graphite Member",
    body: "Need this hoodie silhouette in washed black with heavier cotton.",
    createdAt: "2h",
    moderationStatus: "approved" as const,
  },
  {
    id: "seed-dates",
    authorName: "Atelier Signal",
    body: "The drop map needs clearer dates, but the quieter Square direction works.",
    createdAt: "5h",
    moderationStatus: "approved" as const,
  },
];

const replySamples = [
  "Agree — the access layer should stay calm and practical.",
  "A compact timeline would make the drop path clearer.",
];

export default function CommentThread({ comments, draft, onDraftChange, onSubmit, labels }: CommentThreadProps) {
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const visibleComments = comments.length > 0 ? comments : fallbackComments;

  return (
    <section className="mt-6 border-t border-white/10 pt-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/36">{labels.title}</p>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/36">
          {visibleComments.length}
        </span>
      </div>

      <div className="space-y-5">
        {visibleComments.map((comment, index) => {
          const repliesOpen = Boolean(openReplies[comment.id]);
          const replyCount = index === 0 ? 2 : index === 1 ? 1 : 0;
          return (
            <article key={comment.id} className="relative grid grid-cols-[2.5rem_1fr] gap-3">
              <div className="relative flex justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] font-serif text-lg text-white/86">
                  {comment.authorName.slice(0, 1)}
                </span>
                {replyCount > 0 ? <span className="absolute bottom-[-2.25rem] top-11 w-px bg-white/10" aria-hidden="true" /> : null}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white/82">{comment.authorName}</p>
                  <LiveTimestamp seed={`${comment.id}-${comment.createdAt}`} className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/34" />
                  <button type="button" className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-white/35 luxury-hover hover:bg-white/[0.04] hover:text-white" aria-label="Comment menu">
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-sm leading-7 text-white/68">{comment.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/42">
                  <button type="button" className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2 luxury-hover hover:bg-white/[0.04] hover:text-white">
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                    {index === 0 ? "2K" : index === 1 ? "318" : "84"}
                  </button>
                  <button type="button" className="inline-flex min-h-8 items-center rounded-full px-2 luxury-hover hover:bg-white/[0.04] hover:text-white" aria-label="Dislike comment">
                    <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" className="inline-flex min-h-8 items-center rounded-full px-3 font-semibold luxury-hover hover:bg-white/[0.04] hover:text-white">
                    {labels.reply}
                  </button>
                </div>
                {replyCount > 0 ? (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setOpenReplies((current) => ({ ...current, [comment.id]: !current[comment.id] }))}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full px-2 text-xs font-semibold text-velmere-gold luxury-hover hover:bg-velmere-gold/10"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${repliesOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                      {replyCount} {labels.replies}
                    </button>
                    {repliesOpen ? (
                      <div className="mt-3 space-y-3 pl-2">
                        {replySamples.slice(0, replyCount).map((reply, replyIndex) => (
                          <div key={`${comment.id}-${replyIndex}`} className="grid grid-cols-[2rem_1fr] gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-xs text-white/72">V</span>
                            <div>
                              <p className="text-xs font-semibold text-white/70">Velmère Square <span className="ml-2 font-mono text-[10px] text-white/34">now</span></p>
                              <p className="mt-1 text-xs leading-6 text-white/58">{reply}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-white/10 bg-[#050505]/95 pt-4 backdrop-blur-xl">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={labels.placeholder}
          className="min-h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-[#111] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-velmere-gold/40"
        />
        <button type="button" onClick={onSubmit} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-velmere-gold/30 px-4 text-velmere-gold luxury-hover hover:bg-velmere-gold/10" aria-label={labels.post}>
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {comments.length === 0 ? <p className="mt-3 text-xs leading-6 text-white/34">{labels.empty}</p> : null}
    </section>
  );
}
