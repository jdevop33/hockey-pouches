/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Hockey Pouches - Research & Benefits';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(to bottom, #0ea5e9, #0c4a6e)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <img
            src="https://hockey-pouches.vercel.app/images/logo/logo3.svg"
            alt="Hockey Pouches Logo"
            width={120}
            height={120}
            style={{ marginRight: 24 }}
          />
          <div style={{ fontWeight: 'bold' }}>Hockey Pouches</div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            marginBottom: 24,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Research & Benefits
        </div>
        <div
          style={{
            fontSize: 32,
            textAlign: 'center',
            maxWidth: 800,
            opacity: 0.9,
          }}
        >
          Discover the science behind nicotine pouches and how they can enhance your performance on
          the ice
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
