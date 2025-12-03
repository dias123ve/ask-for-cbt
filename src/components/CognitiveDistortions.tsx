import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Filter, 
  Brain, 
  Target, 
  Glasses,
  Scale,
  Heart,
  CloudRain,
  Zap,
  Tag
} from "lucide-react";

const distortions = [
  {
    icon: Filter,
    title: "Mental Filtering",
    description: "Focusing only on the negatives and ignoring the positives in a situation.",
    example: '"The presentation went well, but I stumbled on one answer, so it was a disaster."',
  },
  {
    icon: AlertTriangle,
    title: "Catastrophizing",
    description: "Expecting the worst possible outcome from every situation.",
    example: '"If I fail this test, my whole career is over."',
  },
  {
    icon: Target,
    title: "All-or-Nothing",
    description: "Seeing things in black and white with no middle ground.",
    example: '"If I\'m not perfect, I\'m a total failure."',
  },
  {
    icon: Brain,
    title: "Mind Reading",
    description: "Assuming you know what others are thinking without evidence.",
    example: '"Everyone in the room thinks I\'m incompetent."',
  },
  {
    icon: Glasses,
    title: "Fortune Telling",
    description: "Predicting negative outcomes without realistic evidence.",
    example: '"I know this relationship will end badly."',
  },
  {
    icon: Scale,
    title: "Should Statements",
    description: 'Using "should," "must," or "ought to" to set unrealistic expectations.',
    example: '"I should never make mistakes."',
  },
  {
    icon: Tag,
    title: "Labeling",
    description: "Attaching negative labels to yourself or others.",
    example: '"I\'m such an idiot" instead of "I made a mistake."',
  },
  {
    icon: Heart,
    title: "Emotional Reasoning",
    description: "Believing something is true because it feels true.",
    example: '"I feel anxious, so something bad must be about to happen."',
  },
  {
    icon: CloudRain,
    title: "Overgeneralization",
    description: "Drawing broad conclusions from a single event.",
    example: '"I failed once, so I always fail."',
  },
  {
    icon: Zap,
    title: "Personalization",
    description: "Taking responsibility for things outside your control.",
    example: '"My team didn\'t meet the goal because of me."',
  },
];

export const CognitiveDistortions = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Understanding Patterns</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4">
            Common Cognitive Distortions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn to recognize these thinking patterns that can contribute to anxiety, 
            depression, and other challenges.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distortions.map((distortion, index) => {
            const Icon = distortion.icon;
            return (
              <Card 
                key={distortion.title} 
                className="group border-border/50 hover:border-primary/30 hover:shadow-soft transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="font-display text-lg">{distortion.title}</CardTitle>
                  <CardDescription className="text-sm">{distortion.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg p-3">
                    {distortion.example}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
