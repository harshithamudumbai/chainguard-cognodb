import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotFound } from '../pages/NotFound';

describe('NotFound component', () => {
  it('renders correctly', () => {
    render(<NotFound />);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});
