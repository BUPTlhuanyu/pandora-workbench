import React from 'react';
import { render, screen } from '@testing-library/react';
import CodeMirror from './index';

test('renders learn react link', () => {
  render(<CodeMirror />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
