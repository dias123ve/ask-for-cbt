import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ThoughtRecord } from "@/components/ThoughtRecord";
import { CognitiveDistortions } from "@/components/CognitiveDistortions";
import { MoodTracker } from "@/components/MoodTracker";
import { CBTExercises } from "@/components/CBTExercises";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <section id="exercises">
          <CBTExercises />
        </section>
        <section id="journal">
          <ThoughtRecord />
        </section>
        <section id="learn">
          <CognitiveDistortions />
        </section>
        <section id="mood">
          <MoodTracker />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
