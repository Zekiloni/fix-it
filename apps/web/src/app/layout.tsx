import './global.css';
import { SiteHeader } from '../components/site-header';

export const metadata = {
  title: 'CityFix',
  description: 'Report and track urban infrastructure problems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
