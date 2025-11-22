import React, { useState } from 'react';
import { ActivityLevel, UserPreferences } from '../types';
import { MapPin, DollarSign, Heart, Globe, Plane } from 'lucide-react';

interface Props {
  onSave: (prefs: UserPreferences) => void;
  initialData?: UserPreferences | null;
}

export const PreferencesForm: React.FC<Props> = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState<UserPreferences>(initialData || {
    originCity: '',
    preferredAirport: 'SFO', // Default for test
    budget: 2000,
    currency: 'USD',
    activityLevel: ActivityLevel.MODERATE,
    interests: [],
    excludedDestinations: []
  });

  const [interestInput, setInterestInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, interestInput.trim()] }));
      setInterestInput('');
    }
  };

  const handleAddExcluded = () => {
    if (excludedInput.trim()) {
      setFormData(prev => ({ ...prev, excludedDestinations: [...prev.excludedDestinations, excludedInput.trim()] }));
      setExcludedInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Customize Your Journey</h2>
        <p className="mt-2 text-gray-600">Tell us what you love, and we'll find the perfect trip.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Origin & Airport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="e.g. New York"
                value={formData.originCity}
                onChange={e => setFormData({ ...formData, originCity: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Airport Code</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Plane className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border uppercase"
                placeholder="e.g. JFK"
                value={formData.preferredAirport}
                onChange={e => setFormData({ ...formData, preferredAirport: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </div>

        {/* Budget & Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                required
                min="100"
                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border"
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(ActivityLevel).map(level => (
              <button
                key={level}
                type="button"
                className={`border rounded-md py-3 text-sm font-medium transition-colors ${
                  formData.activityLevel === level
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setFormData({ ...formData, activityLevel: level })}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interests & Hobbies</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="e.g. Hiking, Museums, Food"
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {interest}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests.filter((_, i) => i !== idx) }))}
                  className="ml-1.5 h-4 w-4 text-indigo-400 hover:text-indigo-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Excluded */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excluded Destinations</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="e.g. Antarctica"
              value={excludedInput}
              onChange={e => setExcludedInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddExcluded())}
            />
            <button
              type="button"
              onClick={handleAddExcluded}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200"
            >
              Exclude
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.excludedDestinations.map((dest, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {dest}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, excludedDestinations: prev.excludedDestinations.filter((_, i) => i !== idx) }))}
                  className="ml-1.5 h-4 w-4 text-red-400 hover:text-red-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
};