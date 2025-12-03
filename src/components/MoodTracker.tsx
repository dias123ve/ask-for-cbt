import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Smile, Meh, Frown, Angry, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const moods = [
  { icon: Angry, label: "Awful", value: 1, color: "text-destructive" },
  { icon: Frown, label: "Bad", value: 2, color: "text-orange-500" },
  { icon: Meh, label: "Okay", value: 3, color: "text-yellow-500" },
  { icon: Smile, label: "Good", value: 4, color: "text-primary" },
  { icon: Heart, label: "Great", value: 5, color: "text-pink-500" },
];

interface MoodEntry {
  date: string;
  value: number;
  label: string;
}

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([
    { date: "Mon", value: 3, label: "Okay" },
    { date: "Tue", value: 4, label: "Good" },
    { date: "Wed", value: 2, label: "Bad" },
    { date: "Thu", value: 4, label: "Good" },
    { date: "Fri", value: 5, label: "Great" },
    { date: "Sat", value: 4, label: "Good" },
  ]);
  const [logged, setLogged] = useState(false);

  const handleLogMood = () => {
    if (selectedMood) {
      const mood = moods.find((m) => m.value === selectedMood);
      if (mood) {
        setEntries([...entries, { date: "Today", value: selectedMood, label: mood.label }]);
        setLogged(true);
      }
    }
  };

  const maxHeight = 100;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Track Progress</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4">
              Daily Mood Check-in
            </h2>
            <p className="text-muted-foreground">
              Monitor your emotional patterns over time to gain insights into your mental wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Log mood card */}
            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-xl">How are you feeling?</CardTitle>
                <CardDescription>Select the mood that best describes how you feel right now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {logged ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium mb-2">Mood logged!</p>
                    <p className="text-muted-foreground text-sm">
                      Great job checking in with yourself today.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      {moods.map((mood) => {
                        const Icon = mood.icon;
                        return (
                          <button
                            key={mood.value}
                            onClick={() => setSelectedMood(mood.value)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200",
                              selectedMood === mood.value
                                ? "bg-primary/10 scale-110"
                                : "hover:bg-muted"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-8 h-8 transition-colors",
                                selectedMood === mood.value ? mood.color : "text-muted-foreground"
                              )}
                            />
                            <span className="text-xs font-medium">{mood.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={handleLogMood} 
                      className="w-full" 
                      disabled={!selectedMood}
                    >
                      Log Mood
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Mood history card */}
            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-xl">This Week</CardTitle>
                <CardDescription>Your mood patterns over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-3 h-32">
                  {entries.slice(-7).map((entry, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-500",
                          entry.value >= 4 ? "bg-primary" : 
                          entry.value === 3 ? "bg-yellow-500" : 
                          "bg-orange-500"
                        )}
                        style={{ 
                          height: `${(entry.value / 5) * maxHeight}px`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Average mood</p>
                    <p className="text-2xl font-display font-medium text-foreground">
                      {(entries.reduce((acc, e) => acc + e.value, 0) / entries.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <p className="text-sm font-medium text-primary flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Improving
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
