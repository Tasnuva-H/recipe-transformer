import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('RecipeTransformer', () => {
  test('renders app title and tagline', () => {
    render(<App />);
    expect(screen.getByText('Recipe Transformer')).toBeInTheDocument();
    expect(screen.getByText(/Discover recipes tailored to your ingredients/i)).toBeInTheDocument();
  });

  test('renders search view with ingredients input', () => {
    render(<App />);
    expect(screen.getByLabelText(/What ingredients do you have/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. chicken, garlic, rice/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Find recipes by ingredients/i })).toBeInTheDocument();
  });

  test('renders diet filter section', () => {
    render(<App />);
    expect(screen.getByText('Diet')).toBeInTheDocument();
  });

  test('search button is enabled when ingredients are entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByPlaceholderText(/e\.g\. chicken, garlic, rice/i);
    await user.type(input, 'chicken');
    expect(screen.getByRole('button', { name: /Find recipes by ingredients/i })).not.toBeDisabled();
  });
});
