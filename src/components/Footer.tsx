import { Brain, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-medium">MindShift</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About CBT</a>
            <a href="#" className="hover:text-foreground transition-colors">Resources</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </nav>

          {/* Made with love */}
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for mental wellness
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            This app provides general information and exercises for educational purposes only. 
            It is not a substitute for professional mental health treatment. If you're experiencing 
            a mental health crisis, please contact a healthcare provider or crisis hotline.
          </p>
        </div>
      </div>
    </footer>
  );
};
