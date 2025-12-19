"use client";

import { FolderKanban, UserPlus, ClipboardList, User } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useHomeCounts } from "@/hooks/useHomeCounts";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { HomeCard } from "@/components/home/HomeCard";

export default function HomePage() {
  const { user, loading: userLoading } = useUser();
  const { myProjectsCount, manageProjectsCount, loading: countsLoading } =
    useHomeCounts();

  const loading = userLoading || countsLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  const userName = user?.name || user?.short_name || "User";

  const homeCards = [
    {
      title: "My Projects",
      icon: ClipboardList,
      path: "/my-projects",
      color: "bg-blue-500",
      description: "View and manage your assignments",
      count: myProjectsCount,
    },
    {
      title: "Manage Projects",
      icon: FolderKanban,
      path: "/management",
      color: "bg-green-500",
      description: "Oversee all active projects",
      count: manageProjectsCount,
    },
    {
      title: "Assign Projects",
      icon: UserPlus,
      path: "/assign-projects",
      color: "bg-purple-500",
      description: "Distribute work to translators",
    },
    {
      title: "My Profile",
      icon: User,
      path: "/profile",
      color: "bg-indigo-500",
      description: "Update your information",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl" />
        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 dark:text-green-400 text-sm">
              Online
            </span>
          </div>
          <h1 className="text-gray-900 dark:text-white mb-3 text-4xl md:text-5xl font-bold">
            <TypewriterText text="Welcome back, " speed={50} delay={0} />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <TypewriterText text={userName} speed={50} delay={700} />
            </span>
            <TypewriterText text="! 👋" speed={50} delay={900 + userName.length * 50} />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            You&apos;re doing great! Keep up the excellent work.
          </p>
        </div>
      </div>

      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-gray-900 dark:text-white text-2xl mb-2 font-semibold">
          What are we doing today?
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Quick access to your most used features
        </p>
      </div>

      {/* Home Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeCards.map((card) => (
          <HomeCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
