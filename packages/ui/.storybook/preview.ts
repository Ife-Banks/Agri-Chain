import type { Preview } from '@storybook/react';
import '../src/globals.css';
import '../src/tokens/colors.css';
import '../src/tokens/typography.css';
import '../src/tokens/spacing.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: {
      default: 'page',
      values: [
        { name: 'page', value: '#F7F9FB' },
        { name: 'surface', value: '#FFFFFF' },
        { name: 'dark', value: '#1A202C' },
      ],
    },
  },
};

export default preview;
