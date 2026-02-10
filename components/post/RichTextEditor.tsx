'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import { motion } from 'framer-motion'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    maxLength?: number
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = 'Share your confession...',
    maxLength = 1000
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
            }),
            Underline,
            TextAlign.configure({
                types: ['paragraph'],
            }),
        ],
        content: content ? JSON.parse(content) : '',
        immediatelyRender: false, // SSR-safe
        onUpdate: ({ editor }) => {
            const json = JSON.stringify(editor.getJSON())
            onChange(json)
        },
        editorProps: {
            attributes: {
                class: 'prose prose-rose max-w-none focus:outline-none min-h-[150px] p-4',
            },
        },
    })

    if (!editor) return null

    const charCount = editor.getText().length

    return (
        <div className="border border-blush rounded-xl overflow-hidden focus-within:border-rose-light transition-colors">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-blush/50 border-b border-blush">
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <div className="w-px h-6 bg-rose-light/30" />

                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        title="Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        title="Justify"
                    >
                        <AlignJustify className="w-4 h-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                {/* Character count */}
                <div className="ml-auto text-xs text-text-secondary">
                    <span className={charCount > maxLength * 0.9 ? 'text-rose-dark' : ''}>
                        {charCount}
                    </span>
                    /{maxLength}
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white">
                <EditorContent
                    editor={editor}
                    className="[&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:p-4"
                />
                {editor.isEmpty && (
                    <p className="absolute top-[60px] left-4 text-text-secondary pointer-events-none">
                        {placeholder}
                    </p>
                )}
            </div>
        </div>
    )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center gap-0.5">{children}</div>
}

function ToolbarButton({
    children,
    onClick,
    isActive,
    title
}: {
    children: React.ReactNode
    onClick: () => void
    isActive: boolean
    title: string
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            title={title}
            className={`
        p-2 rounded-lg transition-colors
        ${isActive
                    ? 'bg-rose-primary text-white'
                    : 'text-text-secondary hover:bg-rose-light/30 hover:text-rose-dark'
                }
      `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    )
}
