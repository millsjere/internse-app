'use client';

export default function CompaniesBrowsePage() {
  const companies = [
    {
      id: 1,
      name: 'Tech Company Inc.',
      industry: 'Technology',
      openPositions: 5,
      logo: '🏢',
    },
    {
      id: 2,
      name: 'StartUp XYZ',
      industry: 'SaaS',
      openPositions: 3,
      logo: '🚀',
    },
    {
      id: 3,
      name: 'Design Studio',
      industry: 'Design',
      openPositions: 2,
      logo: '🎨',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Companies</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="card text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">{company.logo}</div>
              <h3 className="text-xl font-bold mb-2">{company.name}</h3>
              <p className="text-gray-600 mb-4">{company.industry}</p>
              <p className="text-primary font-semibold">{company.openPositions} open positions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
