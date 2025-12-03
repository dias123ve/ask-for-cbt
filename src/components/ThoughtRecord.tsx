import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PenLine, ArrowRight, CheckCircle2 } from "lucide-react";

interface ThoughtEntry {
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number;
  cognitiveDistortion: string;
  alternativeThought: string;
  newEmotionIntensity: number;
}

export const ThoughtRecord = () => {
  const [step, setStep] = useState(0);
  const [entry, setEntry] = useState<ThoughtEntry>({
    situation: "",
    automaticThought: "",
    emotion: "",
    emotionIntensity: 50,
    cognitiveDistortion: "",
    alternativeThought: "",
    newEmotionIntensity: 50,
  });

  const steps = [
    {
      title: "What happened?",
      description: "Describe the situation that triggered your thoughts",
      field: "situation" as const,
      placeholder: "I was at a meeting and my manager didn't acknowledge my idea...",
    },
    {
      title: "What went through your mind?",
      description: "Write down your automatic thought",
      field: "automaticThought" as const,
      placeholder: "They think I'm incompetent and my ideas are worthless...",
    },
    {
      title: "How did you feel?",
      description: "Name the emotion and rate its intensity",
      field: "emotion" as const,
      placeholder: "Anxious, embarrassed, frustrated...",
      hasSlider: true,
    },
    {
      title: "Challenge the thought",
      description: "What's the evidence for and against this thought?",
      field: "cognitiveDistortion" as const,
      placeholder: "My manager was busy and distracted. They've praised my work before...",
    },
    {
      title: "Reframe your thinking",
      description: "Write a more balanced alternative thought",
      field: "alternativeThought" as const,
      placeholder: "My manager was preoccupied. My ideas have value even if not acknowledged immediately...",
      hasSlider: true,
      sliderLabel: "How do you feel now?",
    },
  ];

  const currentStep = steps[step];
  const isComplete = step >= steps.length;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setEntry({
      situation: "",
      automaticThought: "",
      emotion: "",
      emotionIntensity: 50,
      cognitiveDistortion: "",
      alternativeThought: "",
      newEmotionIntensity: 50,
    });
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-4">
              <PenLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Interactive Exercise</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4">
              Thought Record Journal
            </h2>
            <p className="text-muted-foreground">
              Work through your thoughts step by step to gain clarity and perspective.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === step
                    ? "w-8 bg-primary"
                    : index < step
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Card */}
          <Card className="shadow-soft border-border/50 animate-scale-in">
            {isComplete ? (
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-medium mb-4">Well done!</h3>
                <p className="text-muted-foreground mb-6">
                  You've completed a thought record. Notice how your emotional intensity changed 
                  from {entry.emotionIntensity}% to {entry.newEmotionIntensity}%.
                </p>
                <Button onClick={handleReset} variant="calm">
                  Start Another Record
                </Button>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl">{currentStep.title}</CardTitle>
                  <CardDescription>{currentStep.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor={currentStep.field} className="sr-only">
                      {currentStep.title}
                    </Label>
                    <Textarea
                      id={currentStep.field}
                      placeholder={currentStep.placeholder}
                      value={entry[currentStep.field]}
                      onChange={(e) =>
                        setEntry({ ...entry, [currentStep.field]: e.target.value })
                      }
                      className="min-h-[120px] resize-none bg-background border-border focus:border-primary/50"
                    />
                  </div>

                  {currentStep.hasSlider && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">
                          {currentStep.sliderLabel || "Emotional intensity"}
                        </Label>
                        <span className="text-sm font-medium text-primary">
                          {step === 2 ? entry.emotionIntensity : entry.newEmotionIntensity}%
                        </span>
                      </div>
                      <Slider
                        value={[step === 2 ? entry.emotionIntensity : entry.newEmotionIntensity]}
                        onValueChange={(value) =>
                          setEntry({
                            ...entry,
                            [step === 2 ? "emotionIntensity" : "newEmotionIntensity"]: value[0],
                          })
                        }
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Intense</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleNext}
                    className="w-full"
                    disabled={!entry[currentStep.field]}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};
