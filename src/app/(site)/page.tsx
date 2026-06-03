import { getSergioAvailability } from '@/lib/availability';
import { getHomeStats } from '@/lib/home-stats';
import { HomePageContent } from '@/components/home/home-page-content';

export default async function HomePage() {
  const [availability, stats] = await Promise.all([
    getSergioAvailability(),
    getHomeStats(),
  ]);

  return (
    <HomePageContent
      availability={availability}
      stats={stats}
    />
  );
}
