
import React from 'react';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between animate-fade-in">
      <div className="flex items-center">
        <div className="relative w-10 h-10 bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center rounded-lg mr-3">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-1.5">
            <div className="bg-background/90 rounded-sm"></div>
            <div className="bg-background/40 rounded-sm"></div>
            <div className="bg-background/60 rounded-sm"></div>
            <div className="bg-background/20 rounded-sm"></div>
          </div>
        </div>
        <h1 className="text-xl font-medium tracking-tight">QuadScape</h1>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">About</a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
          className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          GitHub
        </a>
      </nav>
      
      <button className="md:hidden text-foreground p-2 rounded-md hover:bg-secondary transition-colors">
        <ChevronDown size={20} />
      </button>
    </header>
  );
};

export default Header;
