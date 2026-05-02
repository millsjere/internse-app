export const JOB_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Design',
  'Engineering',
  'Sales',
  'Operations',
  'Legal',
  'Other',
] as const;

export type JobIndustry = (typeof JOB_INDUSTRIES)[number];
