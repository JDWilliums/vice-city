'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { WikiRevision } from '@/lib/wikiFirestoreService';

interface RevisionHistoryProps {
  revisions: WikiRevision[];
  onViewRevision: (revisionId: string) => void;
  onCompareRevisions: (revisionId1: string, revisionId2: string) => void;
}

export default function RevisionHistory({ 
  revisions, 
  onViewRevision,
  onCompareRevisions 
}: RevisionHistoryProps) {
  const [selectedRevisions, setSelectedRevisions] = useState<string[]>([]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleRevisionCheckbox = (revisionId: string) => {
    setSelectedRevisions(prev => {
      // If already selected, remove it
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId);
      }
      
      // If we already have 2 selected, replace the oldest one
      if (prev.length === 2) {
        return [prev[1], revisionId];
      }
      
      // Otherwise, add it
      return [...prev, revisionId];
    });
  };
  
  const canCompare = selectedRevisions.length === 2;
  
  // Helper to find previous revision index
  const findPreviousRevisionIndex = (currentIndex: number) => {
    if (currentIndex < revisions.length - 1) {
      return currentIndex + 1;
    }
    return -1;
  };
  
  // Quick compare with previous revision
  const compareWithPrevious = (currentIndex: number) => {
    const prevIndex = findPreviousRevisionIndex(currentIndex);
    if (prevIndex !== -1) {
      onCompareRevisions(revisions[currentIndex].id, revisions[prevIndex].id);
    }
  };
  
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Revision History</h3>
        
        {canCompare && (
          <button
            onClick={() => onCompareRevisions(selectedRevisions[0], selectedRevisions[1])}
            className="px-3 py-1.5 bg-gta-blue/90 hover:bg-gta-blue text-sm text-white rounded-md flex items-center"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Compare Selected
          </button>
        )}
      </div>
      
      {revisions.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-400">No revisions found.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {revisions.map((revision, index) => (
            <div key={revision.id} className={`px-4 py-3 hover:bg-gray-800/50 ${index === 0 ? 'bg-gray-800/30' : ''}`}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`revision-${revision.id}`}
                  checked={selectedRevisions.includes(revision.id)}
                  onChange={() => handleRevisionCheckbox(revision.id)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-gta-blue focus:ring-2"
                />
                
                <div className="ml-3 flex-grow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {revision.user?.uid && (
                        <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {revision.user.displayName ? revision.user.displayName.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">
                        {revision.user?.displayName || 'Unknown User'}
                        {index === 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gta-blue/30 text-gta-blue rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(revision.timestamp)}
                        {revision.changeDescription && (
                          <span className="ml-2 text-gray-400">— {revision.changeDescription}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {index < revisions.length - 1 && (
                    <button
                      onClick={() => compareWithPrevious(index)}
                      className="px-3 py-1 bg-gta-blue/70 hover:bg-gta-blue text-xs text-white rounded-md flex items-center"
                      title="Compare with previous revision"
                    >
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Compare
                    </button>
                  )}
                  <button
                    onClick={() => onViewRevision(revision.id)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded-md"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RevisionCompareProps {
  originalRevision: WikiRevision | null;
  newRevision: WikiRevision | null;
  onClose: () => void;
}

export function RevisionCompare({ 
  originalRevision, 
  newRevision,
  onClose
}: RevisionCompareProps) {
  if (!originalRevision || !newRevision) {
    return null;
  }
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Improved diff function for better highlighting
  const diffTexts = (oldText: string, newText: string) => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    const result = [];
    
    // Track summary stats
    const summaryStats = {
      linesAdded: 0,
      linesRemoved: 0,
      linesChanged: 0
    };
    
    for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
      const oldLine = i < oldLines.length ? oldLines[i] : '';
      const newLine = i < newLines.length ? newLines[i] : '';
      
      const isDifferent = oldLine !== newLine;
      
      if (isDifferent) {
        if (!oldLine || oldLine.trim() === '') {
          summaryStats.linesAdded++;
        } else if (!newLine || newLine.trim() === '') {
          summaryStats.linesRemoved++;
        } else {
          summaryStats.linesChanged++;
        }
      }
      
      // Word-level highlighting (simplified approach)
      let highlightedOldLine = oldLine;
      let highlightedNewLine = newLine;
      
      if (isDifferent && oldLine && newLine) {
        // Split lines into words
        const oldWords = oldLine.split(' ');
        const newWords = newLine.split(' ');
        
        // Build highlighted versions
        const oldHighlighted = oldWords.map(word => {
          if (!newLine.includes(word)) {
            return `<span class="bg-red-900/50 text-red-300">${word}</span>`;
          }
          return word;
        });
        
        const newHighlighted = newWords.map(word => {
          if (!oldLine.includes(word)) {
            return `<span class="bg-green-900/50 text-green-300">${word}</span>`;
          }
          return word;
        });
        
        highlightedOldLine = oldHighlighted.join(' ');
        highlightedNewLine = newHighlighted.join(' ');
      }
      
      result.push({
        line: i + 1,
        oldLine,
        newLine,
        highlightedOldLine,
        highlightedNewLine,
        isDifferent
      });
    }
    
    return { diffLines: result, summaryStats };
  };
  
  const { diffLines, summaryStats } = diffTexts(originalRevision.content, newRevision.content);
  
  // Check for field differences outside of content
  const fieldChanges = [];
  if (originalRevision.title !== newRevision.title) {
    fieldChanges.push('Title changed');
  }
  if (originalRevision.description !== newRevision.description) {
    fieldChanges.push('Description changed');
  }
  if (originalRevision.category !== newRevision.category) {
    fieldChanges.push('Category changed');
  }
  if (originalRevision.subcategory !== newRevision.subcategory) {
    fieldChanges.push('Subcategory changed');
  }
  
  return (
    <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Comparing Revisions</h3>
        
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        {/* Summary of Changes */}
        <div className="bg-gray-800/70 p-4 rounded-lg mb-4">
          <h4 className="text-white font-medium mb-2">Summary of Changes</h4>
          <div className="flex flex-wrap gap-3">
            {summaryStats.linesAdded > 0 && (
              <div className="flex items-center px-3 py-1 bg-green-900/30 rounded-full text-green-400 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {summaryStats.linesAdded} line{summaryStats.linesAdded !== 1 ? 's' : ''} added
              </div>
            )}
            {summaryStats.linesRemoved > 0 && (
              <div className="flex items-center px-3 py-1 bg-red-900/30 rounded-full text-red-400 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {summaryStats.linesRemoved} line{summaryStats.linesRemoved !== 1 ? 's' : ''} removed
              </div>
            )}
            {summaryStats.linesChanged > 0 && (
              <div className="flex items-center px-3 py-1 bg-yellow-900/30 rounded-full text-yellow-400 text-sm">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                {summaryStats.linesChanged} line{summaryStats.linesChanged !== 1 ? 's' : ''} modified
              </div>
            )}
            {fieldChanges.map((change, index) => (
              <div key={index} className="flex items-center px-3 py-1 bg-blue-900/30 rounded-full text-blue-400 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {change}
              </div>
            ))}
          </div>
          {newRevision.changeDescription && (
            <div className="mt-3 text-gray-300 text-sm border-t border-gray-700 pt-3">
              <span className="font-medium">Edit comment:</span> {newRevision.changeDescription}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">
              <span className="font-medium text-white">Original</span> - {formatDate(originalRevision.timestamp)} by {originalRevision.user?.displayName || 'Unknown User'}
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">
              <span className="font-medium text-white">Updated</span> - {formatDate(newRevision.timestamp)} by {newRevision.user?.displayName || 'Unknown User'}
            </div>
          </div>
        </div>
        
        <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-700 text-xs bg-gray-800 text-gray-400">
            <div className="p-2">Line</div>
            <div className="p-2">Line</div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {diffLines.map((line, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-2 divide-x divide-gray-700 ${line.isDifferent ? 'bg-gray-800/40' : ''}`}
              >
                <div className={`p-2 font-mono text-xs relative ${line.isDifferent ? 'text-red-400' : 'text-gray-300'}`}>
                  {line.isDifferent && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></span>
                  )}
                  <span className="text-gray-500 inline-block w-8">{line.line}</span>
                  {line.isDifferent ? (
                    <span dangerouslySetInnerHTML={{ __html: line.highlightedOldLine || '\u00A0' }} />
                  ) : (
                    line.oldLine || '\u00A0'
                  )}
                </div>
                
                <div className={`p-2 font-mono text-xs relative ${line.isDifferent ? 'text-green-400' : 'text-gray-300'}`}>
                  {line.isDifferent && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></span>
                  )}
                  <span className="text-gray-500 inline-block w-8">{line.line}</span>
                  {line.isDifferent ? (
                    <span dangerouslySetInnerHTML={{ __html: line.highlightedNewLine || '\u00A0' }} />
                  ) : (
                    line.newLine || '\u00A0'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RevisionViewProps {
  revision: WikiRevision | null;
  isCurrent: boolean;
  onClose: () => void;
  onRestore?: () => void;
}

export function RevisionView({ 
  revision, 
  isCurrent,
  onClose,
  onRestore
}: RevisionViewProps) {
  if (!revision) {
    return null;
  }
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          {isCurrent ? 'Current Version' : 'Revision from ' + formatDate(revision.timestamp)}
        </h3>
        
        <div className="flex gap-2">
          {!isCurrent && onRestore && (
            <button
              onClick={onRestore}
              className="px-3 py-1.5 bg-gta-pink/90 hover:bg-gta-pink text-sm text-white rounded-md flex items-center"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restore This Version
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="bg-gray-800/50 p-3 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {revision.user?.displayName ? revision.user.displayName.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            </div>
            
            <div className="ml-3">
              <div className="text-sm font-medium text-white">
                {revision.user?.displayName || 'Unknown User'}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(revision.timestamp)}
                {revision.changeDescription && (
                  <span className="ml-2 text-gray-400">— {revision.changeDescription}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Title</div>
            <div className="text-white">{revision.title}</div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Category</div>
            <div className="text-white capitalize">{revision.category}</div>
          </div>
          
          {revision.subcategory && (
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Subcategory</div>
              <div className="text-white">{revision.subcategory}</div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded-lg mb-4">
          <div className="text-xs text-gray-400 mb-1">Description</div>
          <div className="text-white">{revision.description}</div>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Content</div>
          <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{revision.content}</div>
        </div>
      </div>
    </div>
  );
} 