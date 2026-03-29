import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Code, Code2,
} from 'lucide-react';

const ToolbarBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg transition-all text-sm ${
      active
        ? 'bg-violet-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-0.5 self-center" />;

export default function RichTextEditor({ value, onChange, placeholder = 'Write your content here…' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[280px] px-4 py-3 focus:outline-none text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-900 prose-a:text-violet-600',
      },
    },
  });

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  if (!editor) return null;

  const btn = (icon, title, action, activeCheck) => (
    <ToolbarBtn onClick={action} active={activeCheck} title={title}>
      {icon}
    </ToolbarBtn>
  );

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-violet-400 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        {/* Undo / Redo */}
        {btn(<Undo size={14} />, 'Undo', () => editor.chain().focus().undo().run(), false)}
        {btn(<Redo size={14} />, 'Redo', () => editor.chain().focus().redo().run(), false)}
        <Divider />

        {/* Headings */}
        {btn(<Heading1 size={14} />, 'Heading 1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
        {btn(<Heading2 size={14} />, 'Heading 2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {btn(<Heading3 size={14} />, 'Heading 3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
        <Divider />

        {/* Formatting */}
        {btn(<Bold size={14} />, 'Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {btn(<Italic size={14} />, 'Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {btn(<UnderlineIcon size={14} />, 'Underline', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
        {btn(<Strikethrough size={14} />, 'Strikethrough', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
        <Divider />

        {/* Alignment */}
        {btn(<AlignLeft size={14} />, 'Align Left', () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
        {btn(<AlignCenter size={14} />, 'Align Center', () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
        {btn(<AlignRight size={14} />, 'Align Right', () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
        <Divider />

        {/* Lists */}
        {btn(<List size={14} />, 'Bullet List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {btn(<ListOrdered size={14} />, 'Numbered List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {btn(<Quote size={14} />, 'Blockquote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
        <Divider />

        {/* Code & Link */}
        {btn(<Code size={14} />, 'Inline Code', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'))}
        {btn(<Code2 size={14} />, 'Code Block', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'))}
        {btn(<LinkIcon size={14} />, 'Add Link', addLink, editor.isActive('link'))}
        <Divider />

        {/* Horizontal Rule */}
        {btn(<Minus size={14} />, 'Divider', () => editor.chain().focus().setHorizontalRule().run(), false)}

        {/* Word count */}
        <span className="ml-auto text-[10px] text-slate-400 pr-1">
          {editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
