import React, { useState } from 'react';
import { WikiPageDetail } from '@/lib/wikiFirestoreService';

interface WikiDetailsEditorProps {
  details: WikiPageDetail[];
  onChange: (details: WikiPageDetail[]) => void;
  category: string;
}

export default function WikiDetailsEditor({ details, onChange, category }: WikiDetailsEditorProps) {
  const [localDetails, setLocalDetails] = useState<WikiPageDetail[]>(details);

  const handleAddDetail = () => {
    // Generate a suggested label based on the current category
    let suggestedLabel = '';
    
    // If there are no details yet, suggest a common first detail based on category
    if (localDetails.length === 0) {
      if (category === 'characters') {
        suggestedLabel = 'Full Name';
      } else if (category === 'locations') {
        suggestedLabel = 'Region';
      } else if (category === 'vehicles') {
        suggestedLabel = 'Manufacturer';
      } else if (category === 'weapons') {
        suggestedLabel = 'Type';
      } else {
        suggestedLabel = 'Category';
      }
    }
    
    const newDetail: WikiPageDetail = {
      label: suggestedLabel,
      value: '',
      type: 'text'
    };
    
    const updatedDetails = [...localDetails, newDetail];
    setLocalDetails(updatedDetails);
    onChange(updatedDetails);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = localDetails.filter((_, i) => i !== index);
    setLocalDetails(updatedDetails);
    onChange(updatedDetails);
  };

  const handleDetailChange = (index: number, field: keyof WikiPageDetail, value: string) => {
    const updatedDetails = localDetails.map((detail, i) => {
      if (i === index) {
        // Create the updated detail
        const updatedDetail = { ...detail, [field]: value };

        // If changing to badge type, ensure badge color is set
        if (field === 'type' && value === 'badge' && !updatedDetail.badgeColor) {
          // Set a default badge color - green is a safe default
          updatedDetail.badgeColor = 'green';
          
          // If the label is "Status", set color based on value
          if (updatedDetail.label.toLowerCase() === 'status') {
            const valueStr = updatedDetail.value.toLowerCase();
            if (valueStr.includes('dead') || valueStr.includes('wanted')) {
              updatedDetail.badgeColor = 'red';
            } else if (valueStr.includes('missing') || valueStr.includes('unknown')) {
              updatedDetail.badgeColor = 'yellow';
            } else if (valueStr.includes('active') || valueStr.includes('alive') || valueStr.includes('available')) {
              updatedDetail.badgeColor = 'green';
            } else {
              updatedDetail.badgeColor = 'blue';
            }
          }
        }
        
        return updatedDetail;
      }
      return detail;
    });
    setLocalDetails(updatedDetails);
    onChange(updatedDetails);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Details Table</h3>
        <button
          onClick={handleAddDetail}
          className="px-4 py-2 bg-gta-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Detail
        </button>
      </div>

      <div className="space-y-4">
        {localDetails.map((detail, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={detail.label}
                  onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                  placeholder="Enter label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={detail.value}
                  onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                  placeholder="Enter value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={detail.type}
                  onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="badge">Badge</option>
                  <option value="link">Link</option>
                </select>
              </div>

              {detail.type === 'badge' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Badge Color
                  </label>
                  <select
                    value={detail.badgeColor || 'green'}
                    onChange={(e) => handleDetailChange(index, 'badgeColor', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                  >
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              )}

              {detail.type === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={detail.linkHref || ''}
                    onChange={(e) => handleDetailChange(index, 'linkHref', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                    placeholder="/wiki/..."
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleRemoveDetail(index)}
                className="px-3 py-1.5 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {localDetails.length === 0 && (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-dashed border-gray-700/50">
          <p className="text-gray-400">No details added yet. Click "Add Detail" to start.</p>
        </div>
      )}
    </div>
  );
} 