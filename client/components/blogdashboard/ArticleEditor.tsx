


import React, { useEffect } from 'react'
import { useEditor, EditorContent, useCurrentEditor, EditorProvider } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';

import { FaBold, FaItalic, FaUnderline, FaHeading } from "react-icons/fa";

import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import classNames from 'classnames';
interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

const ArticleEditor: React.FC<TextEditorProps> = ({ content, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="text-editor">
      {/* Toolbar */}
      <div className="flex">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("bold") && "bg-red-600"
        )}
      >
        <FaBold /> 
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("italic") && "bg-red-600"
        )}
      >
        <FaItalic /> 
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("strike") && "bg-red-600"
        )}
      >
        <Strikethrough className="w-4 h-4"/>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("underline") && "bg-red-600"
        )}
      >
        <FaUnderline /> 
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("code") && "bg-red-600"
        )}
      >
          <Code className="w-5 h-5" />
      </button>
    
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("heading", { level: 1 }) && "bg-red-600"
        )}
      >
        <FaHeading /> <div>H1</div>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("heading", { level: 2 }) && "bg-red-600"
        )}
      >
        <FaHeading /> <div>H2</div>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={classNames(
          "bg-black text-white px-4 py-1 rounded flex space-x-2 items-center mx-1",
          editor.isActive("heading", { level: 3 }) && "bg-red-600"
        )}
      >
        <FaHeading /> <div>H3</div>
      </button>
      </div>

      {/* Editor Content */}
      <div className='custom-html'>
      <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default ArticleEditor;
