import React, { useState, useEffect } from 'react';

interface TerminalLoaderProps {
    active: boolean;
    speed?: number;
}

const TerminalLoader: React.FC<TerminalLoaderProps> = ({
    active,
    speed = 100,
}) => {
    const [loaderChars] = useState(['|', '/', '-', '\\']);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (active) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % loaderChars.length);
            }, speed);
        }

        return () => clearInterval(interval);
    }, [active, speed, loaderChars.length]);

    return active ? (
        <span className="inline-block w-4 ml-2">
            {loaderChars[currentIndex]}
        </span>
    ) : null;
};

export default TerminalLoader;
