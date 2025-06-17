import { render, screen, act } from '@testing-library/react';
import TerminalLoader from '../components/Loader/Loader';

jest.useFakeTimers();

describe('TerminalLoader', () => {
    test('renders loader when active', () => {
        render(<TerminalLoader active={true} speed={100} />);
        const loaderElement = screen.getByText('|');
        expect(loaderElement).toBeInTheDocument();
    });

    test('does not render loader when inactive', () => {
        render(<TerminalLoader active={false} />);
        const loaderElement = screen.queryByText('|');
        expect(loaderElement).toBeNull();
    });

    test('cycles through loader characters when active', () => {
        render(<TerminalLoader active={true} speed={100} />);
        expect(screen.getByText('|')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(screen.getByText('/')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(screen.getByText('-')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(screen.getByText('\\')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(screen.getByText('|')).toBeInTheDocument();
    });
});
