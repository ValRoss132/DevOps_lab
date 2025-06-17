import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../pages/Auth/Auth';

jest.mock('../stores/useAuthStore', () => ({
    useAuthStore: jest.fn(() => ({
        login: jest.fn(),
        checkAuth: jest.fn(() => Promise.resolve(true)),
    })),
}));

describe('Auth Component', () => {
    test('renders without crashing and shows initial prompt', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <Auth />
                </BrowserRouter>,
            );
        });

        expect(
            await screen.findByText('Enter your nickname:'),
        ).toBeInTheDocument();
    });

    test('focuses input field on render', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <Auth />
                </BrowserRouter>,
            );
        });

        const input = screen.getByRole('textbox');
        expect(document.activeElement).toBe(input);
    });

    test('handles user input and proceeds to password prompt', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <Auth />
                </BrowserRouter>,
            );
        });

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'testuser' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(
            await screen.findByText('Enter your password:'),
        ).toBeInTheDocument();
    });
});
