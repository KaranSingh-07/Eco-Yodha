import { createBrowserRouter } from "react-router";
import { LandingPage } from "./screens/LandingPage";
import { LearningMap } from "./screens/LearningMap";
import { StudentDashboard } from "./screens/StudentDashboard";
import { VideoLecture } from "./screens/VideoLecture";
import { CommunityTasks } from "./screens/CommunityTasks";
import { Leaderboard } from "./screens/Leaderboard";
import { TeacherDashboard } from "./screens/TeacherDashboard";
import { TeacherQuests } from "./screens/TeacherQuests";
import { VideoLibrary } from "./screens/VideoLibrary";
import { VideoPlayer } from "./components/VideoPlayer";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SubtopicMap } from "./screens/SubtopicMap";
import { QuizScreen } from "./screens/QuizScreen";
import React from "react";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [
          { index: true, Component: StudentDashboard },
          { path: "learning-map", Component: LearningMap },
          { path: "module/:moduleId", Component: SubtopicMap },
          { path: "lecture/:nodeId", Component: VideoLecture },
          { path: "quiz/:subtopicId", Component: QuizScreen },
          { path: "tasks", Component: CommunityTasks },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["teacher"]} />,
        children: [
          { path: "teacher", Component: TeacherDashboard },
          { path: "teacher/quests", Component: TeacherQuests },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["student", "teacher"]} />,
        children: [
          { path: "videos", Component: VideoLibrary },
          { path: "videos/:id", Component: VideoPlayer },
          { path: "leaderboard", Component: Leaderboard },
        ],
      },
    ],
  },
]);
