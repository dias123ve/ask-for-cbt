import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  Clock, 
  Leaf, 
  MessageSquare,
  ArrowRight,
  Star
} from "lucide-react";

const exercises = [
  {
    icon: Lightbulb,
    title: "5-4-3-2-1 Grounding",
    duration: "5 min",
    difficulty: "Beginner",
    description: "Use your senses to anchor yourself in the present moment and reduce anxiety.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "Socratic Questioning",
    duration: "10 min",
    difficulty: "Intermediate",
    description: "Challenge your thoughts by asking yourself guided questions to find perspective.",
    color: "bg-secondary",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Leaf,
    title: "Progressive Relaxation",
    duration: "15 min",
    difficulty: "Beginner",
    description: "Release physical tension by systematically relaxing each muscle group.",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Star,
    title: "Gratitude Practice",
    duration: "5 min",
    difficulty: "Beginner",
    description: "Shift focus to positive aspects of life by identifying things you're grateful for.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export const CBTExercises = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-4">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Quick Exercises</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4">
            CBT Techniques to Try
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Evidence-based exercises you can practice anytime to manage stress, 
            anxiety, and negative thinking patterns.
          </p>
        </div>

        {/* Exercise cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {exercises.map((exercise, index) => {
            const Icon = exercise.icon;
            return (
              <Card 
                key={exercise.title}
                className="group border-border/50 hover:border-primary/30 hover:shadow-soft transition-all duration-300 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${exercise.color} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${exercise.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {exercise.duration}
                    </div>
                  </div>
                  <CardTitle className="font-display text-lg mt-4">{exercise.title}</CardTitle>
                  <CardDescription>{exercise.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {exercise.difficulty}
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:text-primary">
                      Start exercise
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
