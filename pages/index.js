'use client';

import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

export default function TxtReader() {
  const [lines, setLines] = useState([]);
  const [index, setIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState('');
  const [fileName, setFileName] = useState('');
  const [customUrl, setCustomUrl] = useState(Cookies.get('customUrl') || 'https://www.move.xyz/[[my-data]]');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    const savedIndex = Cookies.get('lastIndex');
    const savedFile = Cookies.get('lastFile');
    if (savedIndex) {
      setIndex(parseInt(savedIndex, 10));
    }
    if (savedFile) {
      fetch(savedFile)
        .then(response => response.text())
        .then(content => {
          const contentLines = content.split('\n');
          setLines(contentLines);
          setFileName(savedFile);
        })
        .catch(() => {
          Cookies.remove('lastFile');
        });
    }
  }, []);

  useEffect(() => {
    if (lines.length > 0) {
      setCurrentLine(lines[index] || '');
      Cookies.set('lastIndex', index);
      generateLink(lines[index] || '');
    }
  }, [index, lines]);

  useEffect(() => {
    Cookies.set('customUrl', customUrl);
  }, [customUrl]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result.split('\n');
      setLines(content);
      setIndex(0);
      setFileName(file.name);
      Cookies.set('lastFile', file.name);
    };
    reader.readAsText(file);
  };

  const nextLine = () => {
    if (index < lines.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  const prevLine = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };

  const copyToClipboard = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      navigator.clipboard.writeText(textAreaRef.current.value);
    }
  };

  const generateLink = (text) => {
    setGeneratedUrl(customUrl.replace('[[my-data]]', text));
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <input type="file" accept=".txt" onChange={handleFileUpload} className="mb-4 p-2 border rounded shadow-sm" />
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg border">
        <p className="text-sm text-gray-600 mb-2 font-medium">📄 File: {fileName || 'No file selected'}</p>
        <p className="text-sm text-gray-600 mb-2 font-medium">📜 Line {index + 1} / {lines.length}</p>
        <textarea
          ref={textAreaRef}
          className="w-full p-3 border rounded-lg resize-none bg-gray-100 focus:ring focus:ring-blue-300"
          rows={4}
          value={currentLine}
          readOnly
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={prevLine}
            disabled={index === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition disabled:bg-gray-300"
          >
            ⬅ Back
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
          >
            📋 Copy
          </button>
          <button
            onClick={nextLine}
            disabled={index >= lines.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition disabled:bg-gray-300"
          >
            Next ➡
          </button>
        </div>
        <input
          type="text"
          className="w-full p-3 border rounded-lg mt-4 bg-gray-100 focus:ring focus:ring-blue-300"
          placeholder="Enter URL with [[my-data]]"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
        />
        {generatedUrl && (
          <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-blue-500 break-all underline block text-center text-lg font-semibold hover:text-blue-700 transition">
            🔗 Open Link
          </a>
        )}
      </div>
    </div>
  );
}
