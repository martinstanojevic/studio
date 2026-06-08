export const BOOK_CODES = ['AB', 'ABC', 'ABCD', 'XCD'] as const;
export type BookCode = (typeof BOOK_CODES)[number];

export type ResourceType = 'notebook' | 'activity' | 'worksheet' | 'assessment' | 'dataset';

export interface TeachingResourceItem {
  slug: string;
  title: string;
  type: ResourceType;
  description: string;
  books: string[];
  chapter?: string;
  duration?: number;
  tags: string[];
  file?: string;
  featured: boolean;
}

export interface TeachingResourceDetail extends TeachingResourceItem {
  datasetName?: string;
  datasetDescription?: string;
}

export interface ResourceTypeConfig {
  value: ResourceType;
  label: string;
  stripeClass: string;
  badgeBg: string;
  badgeText: string;
}

export const RESOURCE_TYPES: ResourceTypeConfig[] = [
  {
    value: 'notebook',
    label: 'Jupyter Notebook',
    stripeClass: 'bg-[var(--ck-primary-mid)]',
    badgeBg: 'bg-[var(--ck-primary-light)]',
    badgeText: 'text-primary',
  },
  {
    value: 'activity',
    label: 'Interactive Activity',
    stripeClass: 'bg-[var(--ck-teal)]',
    badgeBg: 'bg-[var(--ck-teal-light)]',
    badgeText: 'text-[var(--ck-teal-dark)]',
  },
  {
    value: 'worksheet',
    label: 'Worksheet',
    stripeClass: 'bg-[var(--ck-coral)]',
    badgeBg: 'bg-[var(--ck-coral-light)]',
    badgeText: 'text-[#c43a5a]',
  },
  {
    value: 'assessment',
    label: 'Assessment',
    stripeClass: 'bg-[#e8a838]',
    badgeBg: 'bg-[#fef3d8]',
    badgeText: 'text-[#9a7420]',
  },
  {
    value: 'dataset',
    label: 'Dataset',
    stripeClass: 'bg-[#7c8db5]',
    badgeBg: 'bg-[#e4e9f2]',
    badgeText: 'text-[#5a6a8a]',
  },
];

export function getResourceTypeConfig(type: string): ResourceTypeConfig {
  return RESOURCE_TYPES.find((t) => t.value === type) ?? RESOURCE_TYPES[0]!;
}
