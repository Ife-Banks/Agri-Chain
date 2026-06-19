import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['raised', 'metric', 'flat', 'wallet', 'product'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Raised: Story = {
  args: { variant: 'raised', children: <div>This is a raised card with shadow</div> },
};

export const Metric: Story = {
  args: { variant: 'metric', children: <div><strong>$12,450</strong><br />Total Revenue</div> },
};

export const Flat: Story = {
  args: { variant: 'flat', children: <div>Flat card with border only</div> },
};

export const Wallet: Story = {
  args: { variant: 'wallet', children: <div><strong>$2,450.00</strong><br />Current Balance</div> },
};

export const Product: Story = {
  args: { variant: 'product', children: <div style={{ padding: '1rem' }}>Product card content</div> },
};
