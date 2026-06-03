"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  endDate: string;
  className?: string;
}

export function Countdown({ endDate, className = "" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsEnded(true);
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <span className={`font-mono ${isEnded ? "text-muted-foreground" : ""} ${className}`}>
      {timeLeft}
    </span>
  );
}
