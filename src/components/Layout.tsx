import React, { ReactNode } from 'react';

interface LayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ left, center, right }) => {
  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#121212',
        color: '#f5f5f5',
        display: 'grid',
        gridTemplateColumns: '260px 1fr 260px',
        gap: '8px',
        padding: '8px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {left}
      </div>
      <div
        style={{
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
          padding: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {center}
      </div>
      <div
        style={{
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {right}
      </div>
    </div>
  );
};
