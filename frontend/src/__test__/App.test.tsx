import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
    test('renders without crashing', () => {
        render(<App />);
        expect(screen.getByText(/auth/i)).toBeInTheDocument();
    });

    test('redirects to /auth for unknown routes', () => {
        window.history.pushState({}, 'Test page', '/unknown');
        render(<App />);
        expect(screen.getByText(/auth/i)).toBeInTheDocument();
    });
});
