/* eslint-disable @next/next/no-img-element, react/no-unknown-property, @next/next/no-css-tags */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Luxe Nicotine - Research & Benefits';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const interSemiBold = fetch(
    new URL('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap', import.meta.url)
  ).then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          color: 'white',
          background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
          width: '100%',
          height: '100%',
          padding: 50,
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <img
          src="https://luxe-nicotine.vercel.app/images/logo/logo3.svg"
          alt="Luxe Nicotine Logo"
          width={300}
          height={100}
          style={{ marginBottom: 40 }}
        />
        <div style={{ fontWeight: 'bold', color: '#d4af37' }}>Luxe Nicotine</div>
        <div style={{ fontSize: 36, marginTop: 20, maxWidth: 800 }}>
          The Art of Sensual Indulgence
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
