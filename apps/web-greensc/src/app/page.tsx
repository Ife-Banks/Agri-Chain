import { Button } from '@aisuce/ui';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-h1)', fontWeight: 500, color: 'var(--color-green-600)' }}>
        GreenSC
      </h1>
      <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
        Commodities platform
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button variant="primary" size="lg">Trade Now</Button>
        <Button variant="secondary" size="lg">Register</Button>
      </div>
    </main>
  );
}
