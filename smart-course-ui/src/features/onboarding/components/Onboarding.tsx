import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Welcome to Smart Course! 🎓",
    description:
      "We're excited to help you on your learning journey. Let's get started with a quick tour.",
    icon: "👋",
  },
  {
    title: "Personalized Learning",
    description:
      "Courses are tailored to your grade level, interests, and learning style based on your profile.",
    icon: "✨",
  },
  {
    title: "AI-Generated Content",
    description:
      "Our AI creates comprehensive courses with multiple lessons, key concepts, and learning objectives.",
    icon: "🤖",
  },
  {
    title: "Track Your Progress",
    description:
      "Monitor your learning progress and continue where you left off anytime.",
    icon: "📊",
  },
];

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/dashboard");
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="text-7xl">{currentStepData.icon}</div>
            <CardTitle className="text-2xl">
              {currentStepData.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground text-lg">
            {currentStepData.description}
          </p>

          <div className="flex justify-center gap-2 py-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? "Next" : "Get Started"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
