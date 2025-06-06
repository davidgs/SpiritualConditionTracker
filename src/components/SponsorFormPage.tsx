import React from 'react';
import PersonForm from './shared/PersonForm';

export default function SponsorFormPage({ initialData, onSave, onCancel }) {
  return (
    <PersonForm
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
      title={initialData ? 'Edit Sponsor' : 'Add Sponsor'}
      isDialog={false}
    />
  );
}