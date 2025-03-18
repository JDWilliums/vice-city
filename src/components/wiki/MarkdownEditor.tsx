'use client';

import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  height?: string;
  placeholder?: string;
  label?: string;
}

export default function MarkdownEditor({
  initialValue = '',
  onChange,
  height = 'h-96',
  placeholder = 'Write your content here using Markdown...',
  label = 'Content',
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // Set up marked with heading IDs
  useEffect(() => {
    const renderer = new marked.Renderer();
    renderer.heading = function (text, level) {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h${level} id="${escapedText}" class="anchor-heading">
                ${text}
                <a class="anchor-link" href="#${escapedText}">#</a>
              </h${level}>`;
    };

    marked.use({ renderer });
  }, []);
  
  // Render markdown to HTML
  const htmlContent = useMemo(() => {
    if (!markdown) return '';
    const rawHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [markdown]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMarkdown(value);
    onChange(value);
  };
  
  // Insert markdown syntax at cursor position
  const insertMarkdown = (syntax: string, placeholder = '', selectionOffset = 0) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || placeholder;
    
    // Calculate where to place the cursor after insertion
    const cursorPosition = syntax.includes('$1') 
      ? start + syntax.indexOf('$1')
      : syntax.includes('$0') 
        ? start + syntax.indexOf('$0') 
        : start + (selectionOffset || syntax.length);
    
    const syntaxWithText = syntax.replace('$1', selectedText);
    const finalSyntax = syntaxWithText.replace('$0', '');
    
    const newText = 
      textarea.value.substring(0, start) + 
      finalSyntax + 
      textarea.value.substring(end);
    
    // Update the state first
    setMarkdown(newText);
    onChange(newText);
    
    // Wait for React to update the DOM, then focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };
  
  const toolbarButtons = [
    { 
      id: 'heading', 
      icon: 'Aa', 
      title: 'Heading', 
      submenu: [
        { id: 'h1', label: 'Heading 1', syntax: '# $1\n', placeholder: 'Heading 1' },
        { id: 'h2', label: 'Heading 2', syntax: '## $1\n', placeholder: 'Heading 2' },
        { id: 'h3', label: 'Heading 3', syntax: '### $1\n', placeholder: 'Heading 3' },
        { id: 'h4', label: 'Heading 4', syntax: '#### $1\n', placeholder: 'Heading 4' },
      ]
    },
    { id: 'bold', icon: 'B', title: 'Bold', syntax: '**$1**', placeholder: 'bold text' },
    { id: 'italic', icon: 'I', title: 'Italic', syntax: '*$1*', placeholder: 'italic text' },
    { id: 'link', icon: '🔗', title: 'Link', syntax: '[$1](https://)', placeholder: 'link text' },
    { id: 'image', icon: '🖼️', title: 'Image', syntax: '![Alt text](https://example.com/image.jpg)', selectionOffset: 1 },
    { id: 'ul', icon: '•', title: 'Bullet List', syntax: '- $1\n- Item 2\n- Item 3\n', placeholder: 'Item 1' },
    { id: 'ol', icon: '1.', title: 'Numbered List', syntax: '1. $1\n2. Item 2\n3. Item 3\n', placeholder: 'Item 1' },
    { id: 'code', icon: '</>', title: 'Code', syntax: '`$1`', placeholder: 'code' },
    { id: 'codeblock', icon: '{ }', title: 'Code Block', syntax: '```\n$1\n```', placeholder: 'Enter code here' },
    { id: 'quote', icon: '"', title: 'Quote', syntax: '> $1\n', placeholder: 'Quote' },
    { id: 'hr', icon: '—', title: 'Horizontal Rule', syntax: '\n---\n$0' },
    { id: 'table', icon: '▦', title: 'Table', syntax: '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |\n$0' },
  ];
  
  // Convert height string to style or class
  const heightStyle = height.startsWith('h-') 
    ? { className: height } // It's a Tailwind class
    : { style: { height } }; // It's a CSS value
  
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      
      <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex flex-wrap gap-1">
          {toolbarButtons.map((button) => (
            <div key={button.id} className="relative">
              <button
                type="button"
                className={`p-2 rounded hover:bg-gray-700 transition-colors ${activeTool === button.id ? 'bg-gray-700' : ''}`}
                title={button.title}
                onMouseEnter={() => button.submenu && setActiveTool(button.id)}
                onMouseLeave={() => button.submenu && setActiveTool(null)}
                onClick={() => {
                  if (!button.submenu) {
                    insertMarkdown(button.syntax, button.placeholder, button.selectionOffset);
                  }
                }}
              >
                <span className="text-gray-300">{button.icon}</span>
              </button>
              
              {/* Submenu */}
              {button.submenu && activeTool === button.id && (
                <div 
                  className="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                  onMouseEnter={() => setActiveTool(button.id)}
                  onMouseLeave={() => setActiveTool(null)}
                >
                  {button.submenu.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-gray-300"
                      onClick={() => {
                        insertMarkdown(item.syntax, item.placeholder);
                        setActiveTool(null);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="ml-auto">
            <button
              type="button"
              className={`px-3 py-1 rounded text-sm ${isPreview ? 'bg-gta-blue text-white' : 'text-gray-300 hover:bg-gray-700'} transition-colors`}
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        
        {/* Editor and Preview */}
        <div className="relative" {...heightStyle}>
          {/* Markdown Editor */}
          <textarea
            id="markdown-editor"
            className={`w-full h-full bg-transparent text-gray-200 p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed ${isPreview ? 'hidden' : 'block'}`}
            value={markdown}
            onChange={handleChange}
            placeholder={placeholder}
          />
          
          {/* Preview */}
          {isPreview && (
            <div className="w-full h-full overflow-auto p-4 text-gray-200 prose prose-invert prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          )}
        </div>
      </div>
      
      {/* Markdown help */}
      <div className="mt-2 text-xs text-gray-500 flex items-center">
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"></path>
        </svg>
        <span>Supports Markdown formatting. <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="text-gta-blue hover:underline">Markdown Guide</a></span>
      </div>
    </div>
  );
} 