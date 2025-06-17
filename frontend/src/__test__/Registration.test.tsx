import { render, screen, fireEvent, act } from '@testing-library/react';
import Registration from '../pages/Registration/Registration';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../stores/useAuthStore', () => ({
    useAuthStore: jest.fn(() => ({
        register: jest.fn((nickname) => {
            if (nickname === 'error') {
                return Promise.resolve('Registration failed');
            }
            return Promise.resolve(null);
        }),
    })),
}));

describe('Registration Component', () => {
    test('renders initial prompt', () => {
        render(
            <MemoryRouter>
                <Registration />
            </MemoryRouter>,
        );

        expect(screen.getByText('Enter a nickname:')).toBeInTheDocument();
    });

    test('handles nickname input and transitions to password prompt', () => {
        render(
            <MemoryRouter>
                <Registration />
            </MemoryRouter>,
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'testuser' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(screen.getByText('Enter a password:')).toBeInTheDocument();
    });

    test('handles password confirmation and mismatched passwords', () => {
        render(
            <MemoryRouter>
                <Registration />
            </MemoryRouter>,
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'testuser' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        fireEvent.change(input, { target: { value: 'password123' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        fireEvent.change(input, { target: { value: 'wrongpassword' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(
            screen.getByText('Passwords do not match. Try again.'),
        ).toBeInTheDocument();
    });

    test('handles successful registration', async () => {
        render(
            <MemoryRouter>
                <Registration />
            </MemoryRouter>,
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'testuser' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        fireEvent.change(input, { target: { value: 'password123' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        fireEvent.change(input, { target: { value: 'password123' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        });

        expect(
            screen.getByText('Registration successful! Redirecting to login'),
        ).toBeInTheDocument();
    });

    test('handles registration failure', async () => {
        render(
            <MemoryRouter>
                <Registration />
            </MemoryRouter>,
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'error' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        fireEvent.change(input, { target: { value: 'password123' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        fireEvent.change(input, { target: { value: 'password123' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        });

        expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
});
