import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseClient from "@/lib/api-client/course-client";

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const CourseCreationForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    gradeLevel: "",
    numLessons: 5,
    sourceFilter: "all",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const courseClient = new CourseClient();
      const request = {
        request_id: generateUUID(),
        user_id: userId,
        topic: formData.topic,
        grade_level: formData.gradeLevel,
        num_lessons: formData.numLessons,
        source_filter: formData.sourceFilter,
      };

      const response = await courseClient.createCourse(request);
      
      if (response.status === "SUCCESS") {
        alert("Course generation started successfully!");
        // Invalidate courses query to refetch the updated list
        queryClient.invalidateQueries({ queryKey: ["courses"] });
        navigate("/dashboard");
      } else {
        alert(`Failed to create course: ${response.message}`);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Course</CardTitle>
          <p className="text-muted-foreground">
            Tell us what you'd like to learn and we'll generate a personalized
            course for you.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Course Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Introduction to Python Programming"
                required
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Select
                required
                value={formData.gradeLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, gradeLevel: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="middle">Middle School</SelectItem>
                  <SelectItem value="high">High School</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numLessons">Number of Lessons</Label>
              <Input
                id="numLessons"
                type="number"
                min="1"
                max="20"
                value={formData.numLessons}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numLessons: parseInt(e.target.value) || 5,
                  })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceFilter">Source Filter</Label>
              <Select
                value={formData.sourceFilter}
                onValueChange={(value) =>
                  setFormData({ ...formData, sourceFilter: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="sourceFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="academic">Academic Only</SelectItem>
                  <SelectItem value="practical">Practical Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
