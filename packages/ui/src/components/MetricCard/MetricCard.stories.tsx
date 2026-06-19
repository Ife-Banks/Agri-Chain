import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard';

const meta: Meta<typeof MetricCard> = {
  title: 'UI/MetricCard',
  component: MetricCard,
  argTypes: {
    trend: { control: 'select', options: ['up', 'down', undefined] },
  },
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Revenue: Story = {
  args: { label: 'Total Revenue', value: '$12,450', change: '+12.5% from last month', trend: 'up' },
};

export const Orders: Story = {
  args: { label: 'Orders', value: '156', change: '+8 this week', trend: 'up' },
};

export const Farmers: Story = {
  args: { label: 'Active Farmers', value: '48', change: '+3 this month', trend: 'up' },
};

export const Withdrawal: Story = {
  args: { label: 'Pending Withdrawals', value: '$2,340', change: '-5.2% from last week', trend: 'down' },
};

export const NoChange: Story = {
  args: { label: 'Avg Rating', value: '4.8' },
};
