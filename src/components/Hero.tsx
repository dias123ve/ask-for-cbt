import { Button } from "@/components/ui/button";
import { Brain, Heart, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Your mental wellness companion</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl font-medium text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Transform your
            <span className="block text-primary italic mt-2">thoughts, transform</span>
            your life
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Guided Cognitive Behavioral Therapy exercises to help you understand your mind, 
            challenge negative patterns, and build lasting mental resilience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl">
              Start Your Journey
            </Button>
            <Button variant="calm" size="xl">
              Learn More
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border shadow-soft">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Thought Records</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border shadow-soft">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Mood Tracking</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border shadow-soft">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">CBT Exercises</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
