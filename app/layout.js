import './globals.css';

export const metadata = {
  title: 'ParentPal AI — A calmer next step',
  description: 'Practical, supportive parenting guidance in English and Urdu.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
