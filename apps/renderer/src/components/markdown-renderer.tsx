import React from 'react';
import ReactMarkdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/** Achromatic prose: headings and key phrases in white, narrative in secondary grey, code in mono frames. */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={twMerge("w-full text-fg-2", className)}>
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => <h1 className="mb-4 mt-2 text-[1.6em] font-semibold leading-tight tracking-[-0.02em] text-fg first:mt-0" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="mb-3 mt-7 text-[1.3em] font-semibold leading-snug tracking-[-0.01em] text-fg first:mt-0" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="mb-2 mt-5 text-[1.12em] font-medium text-fg first:mt-0" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="mb-2 mt-4 font-medium text-fg first:mt-0" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3 leading-[1.7] last:mb-0" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-fg" {...props} />,
                    ul: ({ node, ...props }) => <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-fg-4 last:mb-0" {...props} />,
                    ol: ({ node, ...props }) => <ol className="mb-3 list-decimal space-y-1.5 pl-5 marker:font-mono marker:text-fg-3 last:mb-0" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1 leading-[1.65]" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="my-5 border-l-2 border-line-active pl-4 text-fg-2 italic" {...props} />,
                    hr: ({ node, ...props }) => <hr className="my-6 border-line" {...props} />,
                    code: ({ node, ...props }) => {
                        const { className, ...rest } = props;
                        return <code className="rounded-sm border border-line bg-raised px-1 py-px font-mono text-[0.88em] text-fg" {...rest} />;
                    },
                    pre: ({ node, ...props }) => <pre className="mb-4 overflow-x-auto rounded border border-line bg-pane p-3 font-mono text-[0.85em] leading-relaxed [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0" {...props} />,
                    a: ({ node, ...props }) => <a className="cursor-pointer text-fg underline decoration-fg-4 underline-offset-2 transition-colors hover:decoration-fg" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
