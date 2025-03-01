
import React from 'react';
import { GithubIcon, Code, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-10 px-8 mt-20 border-t animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center mb-4">
              <div className="relative w-8 h-8 bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center rounded-lg mr-2">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-1">
                  <div className="bg-background/90 rounded-sm"></div>
                  <div className="bg-background/40 rounded-sm"></div>
                  <div className="bg-background/60 rounded-sm"></div>
                  <div className="bg-background/20 rounded-sm"></div>
                </div>
              </div>
              <h3 className="text-lg font-medium tracking-tight">QuadScape</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              A modern approach to image compression using quad-tree algorithm.
              Developed with React and Tailwind CSS.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <BookOpen size={16} className="mr-2" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <Code size={16} className="mr-2" />
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <GithubIcon size={16} className="mr-2" />
                  Source Code
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">About</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Created to showcase modern web development and advanced image processing
              techniques using data structures and algorithms.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QuadScape. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
