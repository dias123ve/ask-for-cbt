import { Brain, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-medium">MindShift</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#exercises" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Exercises
            </a>
            <a href="#journal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Journal
            </a>
            <a href="#learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Learn
            </a>
            <a href="#mood" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mood
            </a>
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Button>Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <nav className="flex flex-col gap-2">
            <a href="#exercises" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              Exercises
            </a>
            <a href="#journal" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              Journal
            </a>
            <a href="#learn" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              Learn
            </a>
            <a href="#mood" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              Mood
            </a>
            <Button className="mt-2">Get Started</Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
