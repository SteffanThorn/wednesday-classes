import ChristmasRsvpForm from '@/components/ChristmasRsvpForm';

export const metadata = {
  title: 'Christmas Gathering · Inner Light',
  description: 'Move, relax & connect. Help us choose the date for our Christmas yoga gathering.',
  openGraph: {
    title: 'Christmas Gathering · Inner Light',
    description: 'Which date works best for you? December 16 or December 23.',
  },
};

const VALID = ['dec16', 'dec23', 'either', 'no'];

// The invitation's fonts. Loaded with a stylesheet link because Turbopack's
// next/font can't fetch Cormorant Garamond's font files.
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500&display=swap';

// Public page, no login. Option links from the email open it with the answer
// already chosen, e.g. /christmas?choice=dec16
export default async function ChristmasPage({ searchParams }) {
  const params = await searchParams;
  const initialChoice = VALID.includes(params?.choice) ? params.choice : '';
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_URL} precedence="default" />
      <ChristmasRsvpForm initialChoice={initialChoice} />
    </>
  );
}
