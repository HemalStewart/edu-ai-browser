import React from 'react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={twMerge("w-full transition-all", className)}>
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-6 text-foreground tracking-tight" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground tracking-tight" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mb-2 mt-4 text-foreground" {...props} />,
                    p: ({ node, ...props }) => <p className="text-[1.05rem] leading-[1.8] text-foreground/90 mb-5" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-5 space-y-2 text-foreground/90 marker:text-foreground/40" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-foreground/90 marker:text-foreground/40" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500/30 pl-4 py-1 my-6 italic text-foreground/70 bg-blue-500/5 rounded-r-lg" {...props} />,
                    code: ({ node, ...props }) => {
                        const { className, ...rest } = props;
                        return <code className="bg-foreground/5 rounded px-1.5 py-0.5 text-sm font-mono text-blue-600 dark:text-blue-400" {...rest} />;
                    },
                    pre: ({ node, ...props }) => <pre className="bg-foreground/5 p-4 rounded-xl overflow-x-auto mb-6 text-sm border border-foreground/10" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline cursor-pointer font-medium" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
