import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  argTypes: {
    type: { control: 'select', options: ['success', 'warning', 'danger', 'info'] },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Success: Story = {
  args: { type: 'success', children: 'Order placed successfully! Your items are being prepared.' },
};

export const Warning: Story = {
  args: { type: 'warning', children: 'Your wallet balance is low. Please top up to continue trading.' },
};

export const Danger: Story = {
  args: { type: 'danger', children: 'Payment failed. Please check your card details and try again.' },
};

export const Info: Story = {
  args: { type: 'info', children: 'New commodities available for trading. Check the market page.' },
};
