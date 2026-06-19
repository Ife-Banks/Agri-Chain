import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  argTypes: {
    status: { control: 'select', options: ['success', 'warning', 'danger', 'info', 'neutral'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Success: Story = {
  args: { status: 'success', children: 'Delivered' },
};

export const Warning: Story = {
  args: { status: 'warning', children: 'Pending' },
};

export const Danger: Story = {
  args: { status: 'danger', children: 'Cancelled' },
};

export const Info: Story = {
  args: { status: 'info', children: 'In Transit' },
};

export const Neutral: Story = {
  args: { status: 'neutral', children: 'Draft' },
};
