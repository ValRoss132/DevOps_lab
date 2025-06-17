import { render, screen, fireEvent, act } from '@testing-library/react';
import Chat from '../pages/Chat/Chat';
import { MemoryRouter } from 'react-router-dom';

// Мокируем window.location
const mockLocation = {
    pathname: '/',
    assign: jest.fn(),
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

jest.mock('socket.io-client', () => {
    const mSocket = {
        on: jest.fn(),
        emit: jest.fn(),
        off: jest.fn(),
        connected: true,
    };
    return {
        io: jest.fn(() => mSocket),
    };
});

jest.mock('../stores/useAuthStore', () => ({
    useAuthStore: jest.fn(() => ({
        checkAuth: jest.fn(() => Promise.resolve(true)),
        logout: jest.fn(() => Promise.resolve()),
    })),
}));

jest.mock('../stores/useUserStore', () => ({
    useUserStore: jest.fn(() => ({
        user: { id: 1, name: 'testuser' },
        updateUserName: jest.fn(() => Promise.resolve(null)),
        deleteUser: jest.fn(() => Promise.resolve()),
    })),
}));

describe('Chat Component', () => {
    test('renders without crashing and shows initial UI', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Chat />
                </MemoryRouter>,
            );
        });

        expect(screen.getByText('Chat')).toBeInTheDocument();
        expect(
            screen.getByText((_, element) => {
                return element?.textContent === '[connected]';
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Type a message'),
        ).toBeInTheDocument();
    });

    test('sends a message and displays it in the chat', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Chat />
                </MemoryRouter>,
            );
        });

        const input = screen.getByPlaceholderText('Type a message');
        fireEvent.change(input, { target: { value: 'Hello, world!' } });
        await act(async () => {
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        });

        expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    });
});
