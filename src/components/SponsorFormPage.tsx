import React from 'react';
import UnifiedPersonForm from './shared/UnifiedPersonForm';

export default function SponsorFormPage({ initialData, onSave, onCancel }) {
  return (
    <UnifiedPersonForm
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
      title={initialData ? 'Edit Sponsor' : 'Add Sponsor'}
    />
  );
}