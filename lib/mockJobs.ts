export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  location: string;
  remote: boolean;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Hybrid';
  level: 'Entry' | 'Mid' | 'Senior';
  salary: string;
  postedDaysAgo: number;
  tags: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Engineer Intern',
    company: 'Stripe',
    companyInitial: 'S',
    companyColor: 'from-violet-500 to-purple-700',
    location: 'San Francisco, CA',
    remote: false,
    type: 'Internship',
    level: 'Entry',
    salary: '$45/hr',
    postedDaysAgo: 1,
    tags: ['React', 'TypeScript', 'CSS'],
    description: "Stripe is looking for a talented Frontend Engineer Intern to join our team. You'll work on building and improving the core payment interfaces used by millions of businesses worldwide. This is a hands-on role where you'll make real contributions to production code from day one.",
    requirements: ['Currently enrolled in a CS or related degree', 'Experience with React and TypeScript', 'Strong understanding of HTML/CSS', 'Familiarity with REST APIs', 'Passion for building great user experiences'],
    responsibilities: ['Build and maintain frontend components for Stripe Dashboard', 'Collaborate with designers and backend engineers', 'Write clean, tested, and documented code', 'Participate in code reviews', 'Ship features to production'],
    benefits: ['Competitive hourly rate', 'Mentorship from senior engineers', 'Full-time return offer consideration', 'Access to all company events', 'Free meals and snacks'],
  },
  {
    id: '2',
    title: 'Product Design Intern',
    company: 'Figma',
    companyInitial: 'F',
    companyColor: 'from-pink-500 to-rose-600',
    location: 'Remote',
    remote: true,
    type: 'Internship',
    level: 'Entry',
    salary: '$40/hr',
    postedDaysAgo: 2,
    tags: ['Figma', 'UI/UX', 'Prototyping'],
    description: "Join Figma's product design team and help shape the future of collaborative design tools. You'll work alongside world-class designers to improve the experience for Figma's 4M+ users.",
    requirements: ['Portfolio demonstrating strong visual design skills', 'Proficiency with Figma', 'Understanding of design systems', 'Excellent communication skills', 'Eye for detail and aesthetics'],
    responsibilities: ['Design new features from concept to final spec', 'Create high-fidelity mockups and prototypes', 'Contribute to the Figma design system', 'Present work to stakeholders', 'Conduct user research sessions'],
    benefits: ['Competitive stipend', 'Full-time offer consideration', 'Design hardware budget', 'Remote-first team', 'Access to Figma Professional'],
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'Airbnb',
    companyInitial: 'A',
    companyColor: 'from-orange-500 to-amber-600',
    location: 'New York, NY',
    remote: false,
    type: 'Internship',
    level: 'Entry',
    salary: '$50/hr',
    postedDaysAgo: 3,
    tags: ['Python', 'SQL', 'Machine Learning'],
    description: "Airbnb's Data Science team is looking for an intern to help unlock insights from one of the world's largest travel datasets. You'll work on real problems that directly impact how millions of hosts and guests experience Airbnb.",
    requirements: ['Pursuing a degree in Data Science, Statistics, or Math', 'Strong Python and SQL skills', 'Experience with pandas and scikit-learn', 'Familiarity with A/B testing', 'Strong analytical thinking'],
    responsibilities: ['Build and validate predictive models', 'Analyse large datasets to find actionable insights', 'Design and run A/B experiments', 'Present findings to product teams', 'Write data pipelines'],
    benefits: ['Industry-leading pay', 'Mentorship programme', 'Relocation assistance', 'Gym subsidy', 'Return offer consideration'],
  },
  {
    id: '4',
    title: 'Marketing Intern',
    company: 'HubSpot',
    companyInitial: 'H',
    companyColor: 'from-emerald-500 to-green-600',
    location: 'Boston, MA',
    remote: false,
    type: 'Internship',
    level: 'Entry',
    salary: '$30/hr',
    postedDaysAgo: 4,
    tags: ['Content', 'SEO', 'Analytics'],
    description: "Join HubSpot's marketing team to learn the craft of inbound marketing. You'll get hands-on experience running campaigns, creating content, and analysing performance in a fast-paced growth environment.",
    requirements: ['Pursuing a marketing or communications degree', 'Strong writing and communication skills', 'Familiarity with SEO basics', 'Analytical mindset', 'Self-starter attitude'],
    responsibilities: ['Create blog posts and social media content', 'Support email marketing campaigns', 'Analyse campaign performance metrics', 'Assist with SEO optimisations', 'Collaborate with the design team'],
    benefits: ['Flexible working hours', 'HubSpot product certification', 'Mentorship from senior marketers', 'Hybrid work option', 'Career development resources'],
  },
  {
    id: '5',
    title: 'Software Engineering Intern',
    company: 'Notion',
    companyInitial: 'N',
    companyColor: 'from-gray-700 to-gray-900',
    location: 'Remote',
    remote: true,
    type: 'Internship',
    level: 'Entry',
    salary: '$48/hr',
    postedDaysAgo: 5,
    tags: ['React', 'Node.js', 'PostgreSQL'],
    description: "Work on the product used by millions of teams to organise their work and knowledge. As a software engineering intern at Notion, you'll be embedded in a full-stack product team and ship features to production.",
    requirements: ['CS degree in progress or equivalent experience', 'Proficiency in JavaScript or TypeScript', 'Experience with React', 'Familiarity with databases', 'Strong problem-solving skills'],
    responsibilities: ['Build new features end-to-end', 'Fix bugs and improve performance', 'Write unit and integration tests', 'Participate in sprint planning', 'Document your work'],
    benefits: ['Top-of-market compensation', 'Remote-first culture', 'Full-time offer pathway', 'Home office budget', 'Notion team workspace access'],
  },
  {
    id: '6',
    title: 'DevOps Intern',
    company: 'Vercel',
    companyInitial: 'V',
    companyColor: 'from-blue-600 to-indigo-700',
    location: 'Remote',
    remote: true,
    type: 'Internship',
    level: 'Entry',
    salary: '$42/hr',
    postedDaysAgo: 7,
    tags: ['AWS', 'Docker', 'CI/CD'],
    description: "Help us build and scale the infrastructure that powers millions of web deployments every day. You'll work alongside platform engineers to improve reliability, performance, and developer experience.",
    requirements: ['Interest in cloud infrastructure and DevOps', 'Familiarity with Linux', 'Basic scripting skills (Bash or Python)', 'Understanding of networking basics', 'Curiosity and eagerness to learn'],
    responsibilities: ['Automate deployment workflows', 'Monitor infrastructure health', 'Improve CI/CD pipelines', 'Write runbooks and documentation', 'Participate in on-call rotation training'],
    benefits: ['Remote-first team', 'Learning & development budget', 'Vercel Pro account', 'Async-first culture', 'Full-time consideration'],
  },
];

export function getJobById(id: string): Job | undefined {
  return mockJobs.find((j) => j.id === id);
}
