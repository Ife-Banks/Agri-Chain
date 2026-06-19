'use client';

import React from 'react';
import Link from 'next/link';

const LeafLogoWhite = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    <path d="M16 2C8 6 4 16 2 26l2.5 1.5C6 22 8 17 16 16v4l8-9-8-8v4z" fill="#6EE7B7" />
    <path d="M16 2C8 6 4 16 2 26l2.5 1.5C6 22 8 17 16 16" fill="#2D8A50" />
  </svg>
);

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0F1E15',
      color: '#A0BBA8',
      padding: '4rem 0 0',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Top Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <LeafLogoWhite />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                GreenPurse
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7A9A82', maxWidth: 380 }}>
              Nigeria's trusted farm-to-table marketplace. We connect verified farmers
              directly with buyers — no middlemen, fair prices, fresh delivery every time.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[
                { label: 'Twitter', path: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg> },
                { label: 'Instagram', path: <><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></> },
                { label: 'Facebook', path: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#7A9A82', textDecoration: 'none',
                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6EE7B7';
                    e.currentTarget.style.color = '#6EE7B7';
                    e.currentTarget.style.backgroundColor = 'rgba(110,231,183,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#7A9A82';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    {social.path}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Marketplace
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { href: '/products', label: 'All Products' },
                { href: '/products?category=vegetables', label: 'Vegetables' },
                { href: '/products?category=fruits', label: 'Fruits' },
                { href: '/products?category=grains', label: 'Grains & Cereals' },
                { href: '/products?category=tubers', label: 'Tubers' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ fontSize: '0.85rem', color: '#7A9A82', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#7A9A82'; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account Links */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { href: '/orders', label: 'My Orders' },
                { href: '/cart', label: 'Shopping Cart' },
                { href: '/login', label: 'Log in' },
                { href: '/register', label: 'Create Account' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ fontSize: '0.85rem', color: '#7A9A82', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#7A9A82'; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { href: '#', label: 'Help Center' },
                { href: '#', label: 'Contact Us' },
                { href: '#', label: 'Shipping Info' },
                { href: '#', label: 'Returns Policy' },
                { href: '#', label: 'Privacy Policy' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ fontSize: '0.85rem', color: '#7A9A82', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#7A9A82'; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '2rem 0',
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
              Stay in the loop
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7A9A82' }}>
              Get weekly updates on new products and farm deals.
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', gap: '0.5rem', minWidth: 0 }}
          >
            <input
              type="email"
              placeholder="you@email.com"
              style={{
                padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.85rem',
                outline: 'none', minWidth: 220, fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6EE7B7'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            />
            <button
              type="submit"
              style={{
                padding: '0.6rem 1.25rem', borderRadius: 10,
                backgroundColor: 'var(--color-green-600)', color: 'white',
                border: 'none', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-green-800)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-green-600)'; }}
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.75rem', padding: '1.5rem 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#5A7A62' }}>
              &copy; {new Date().getFullYear()} GreenPurse — AI-SUCE Platform. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="#" style={{ fontSize: '0.78rem', color: '#5A7A62', textDecoration: 'none' }}>Terms</Link>
              <Link href="#" style={{ fontSize: '0.78rem', color: '#5A7A62', textDecoration: 'none' }}>Privacy</Link>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#5A7A62' }}>
              Payments secured by
            </span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: '#6EE7B7',
              backgroundColor: 'rgba(110,231,183,0.1)', padding: '0.25rem 0.6rem',
              borderRadius: 6, letterSpacing: '0.03em',
            }}>
              Paystack
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}