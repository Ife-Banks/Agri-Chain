import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    hint: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter your email', label: 'Email' },
};

export const WithHint: Story = {
  args: { placeholder: 'Enter your email', label: 'Email', hint: 'We will never share your email' },
};

export const WithError: Story = {
  args: { placeholder: 'Enter your email', label: 'Email', error: 'Invalid email address' },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled input', label: 'Email', disabled: true },
};

export const Password: Story = {
  args: { type: 'password', placeholder: 'Enter password', label: 'Password' },
};
