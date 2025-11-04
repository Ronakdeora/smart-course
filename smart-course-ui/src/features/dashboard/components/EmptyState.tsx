import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold">No Courses Yet</h2>
          <p className="text-muted-foreground">
            Start your learning journey by creating your first course. We'll
            generate personalized content based on your interests and learning
            level.
          </p>
          <div className="pt-4 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/course/create")}
            >
              Create Your First Course
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/profile/setup")}
            >
              Update Profile Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
