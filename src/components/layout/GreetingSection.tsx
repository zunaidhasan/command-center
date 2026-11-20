import React, { useState, useEffect } from 'react';
import { useProfileStore } from '@/store/useProfileStore';

export const GreetingSection: React.FC = () => {
  const { profile } = useProfileStore();
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 22) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const firstName = profile.displayName.split(' ')[0] || 'Zunaid';

  return (
    <div className="flex flex-col select-none">
      <h1 className="font-heading font-bold text-2xl lg:text-3xl text-text-primary tracking-tight">
        {greeting},{' '}
        <span className="text-primary hover:text-primary-light transition-colors">
          {firstName}!
        </span>
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-1 h-3.5 bg-primary rounded-full inline-block" />
        <p className="text-xs lg:text-sm text-text-secondary font-medium">
          Build smarter. Deliver better.
        </p>
      </div>
    </div>
  );
};
