export interface ContactPerson {
  id?: number;
  userId: string | number;
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactPersonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ContactPerson, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: ContactPerson;
  title: string;
  submitLabel?: string;
}

export interface ContactPersonTabsProps {
  persons: ContactPerson[];
  currentTab: number;
  onTabChange: (event: any, newValue: number) => void;
  addLabel: string;
  emptyMessage: string;
  children: React.ReactNode;
}