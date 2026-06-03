"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  endDate: string;
  className?: string;
}

function formatTimeLeft(diffMs: number): string {
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function Countdown({ endDate, className = "" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const end = new Date(endDate).getTime();

    const calculateTimeLeft = () => {
      const diff = end - Date.now();

      if (diff <= 0) {
        setIsEnded(true);
        setTimeLeft("Ended");
        return;
      }

      setIsEnded(false);
      setTimeLeft(formatTimeLeft(diff));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={`font-mono tabular-nums ${isEnded ? "text-muted-foreground" : ""} ${className}`}
    >
      {timeLeft}
    </span>
  );
}
