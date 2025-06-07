import React from 'react';
import UnifiedPersonForm from './shared/UnifiedPersonForm';

export default function SponseeFormPage({ initialData, onSave, onCancel }) {
  return (
    <UnifiedPersonForm
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
      title={initialData ? 'Edit Sponsee' : 'Add Sponsee'}
    />
  );
}