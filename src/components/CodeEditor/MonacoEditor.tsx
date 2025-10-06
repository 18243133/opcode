import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

export interface MonacoEditorProps {
  /**
   * The content to display in the editor
   */
  value: string;
  /**
   * The programming language for syntax highlighting
   */
  language: string;
  /**
   * Callback when the content changes
   */
  onChange?: (value: string | undefined) => void;
  /**
   * Whether the editor is read-only
   */
  readOnly?: boolean;
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Editor height (default: 100%)
   */
  height?: string | number;
  /**
   * Editor theme (default: vs-dark)
   */
  theme?: string;
  /**
   * Path of the file being edited (for model management)
   */
  path?: string;
}

/**
 * MonacoEditor component - Wrapper around Monaco Editor
 * 
 * @example
 * <MonacoEditor
 *   value={code}
 *   language="typescript"
 *   onChange={(value) => setCode(value || '')}
 * />
 */
export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  onChange,
  readOnly = false,
  className,
  height = '100%',
  theme = 'vs-dark',
  path,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Monaco
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save command - will be handled by parent component
      console.log('Save triggered');
    });

    // Focus the editor
    editor.focus();
  };

  useEffect(() => {
    // Update editor options when readOnly changes
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  return (
    <div className={className} style={{ height }}>
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme}
        path={path}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: {
            enabled: true,
            scale: 1,
          },
          fontSize: 14,
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
          lineNumbers: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          folding: true,
          foldingStrategy: 'indentation',
          renderLineHighlight: 'all',
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          mouseWheelZoom: true,
          contextmenu: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'inline',
          wordBasedSuggestions: 'matchingDocuments',
          parameterHints: {
            enabled: true,
          },
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: {
            top: 10,
            bottom: 10,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
};

/**
 * Get Monaco language from file extension
 */
export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Data
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    
    // Markdown
    'md': 'markdown',
    'markdown': 'markdown',
    
    // Programming languages
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    
    // Shell
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    
    // Config
    'ini': 'ini',
    'conf': 'ini',
    'cfg': 'ini',
    'env': 'shell',
    
    // SQL
    'sql': 'sql',
    
    // Other
    'txt': 'plaintext',
    'log': 'plaintext',
  };
  
  return languageMap[ext || ''] || 'plaintext';
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  // Special files
  if (fileName === 'package.json') return '📦';
  if (fileName === 'tsconfig.json') return '⚙️';
  if (fileName === 'README.md') return '📖';
  if (fileName === '.gitignore') return '🚫';
  if (fileName === 'Cargo.toml') return '📦';
  
  // By extension
  const iconMap: Record<string, string> = {
    'ts': '🔷',
    'tsx': '⚛️',
    'js': '🟨',
    'jsx': '⚛️',
    'json': '📋',
    'md': '📝',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'py': '🐍',
    'rs': '🦀',
    'go': '🐹',
    'java': '☕',
    'c': '©️',
    'cpp': '➕',
    'sh': '🐚',
    'sql': '🗄️',
    'xml': '📄',
    'yaml': '⚙️',
    'yml': '⚙️',
    'toml': '⚙️',
    'env': '🔐',
    'txt': '📄',
    'log': '📜',
  };
  
  return iconMap[ext || ''] || '📄';
}

