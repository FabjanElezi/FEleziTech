import { getPortfolio, getServices } from '@/lib/data';
import ServicesView from '@/components/ServicesView';

// Read from the database on every visit so Admin edits show up straight away.
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const [portfolio, services] = await Promise.all([getPortfolio(), getServices()]);
  return <ServicesView portfolio={portfolio} services={services} />;
}
