import "./App.css";

import { useSelectedProjectName } from "./hooks/useProjects";
import { useFullscreen } from "./hooks/useFullscreen";
import { useEffect } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { ProjectOverview } from "./components/ProjectOverview";
import { CounterSettings } from "./components/CounterSettings";
import { TimerSettings } from "./components/TimerSettings";
import { StitchCounter } from "./components/StitchCounter/StitchCounter";
import { Button } from "./components/ui/button";
import { InstagramCredit } from "./components/InstagramCredit";

const AppContent = () => {
  const projectName = useSelectedProjectName();
  const isFullscreen = useFullscreen();

  const isPopup = window.opener != null;

  // Set document title based on selected project
  useEffect(() => {
    if (projectName) {
      document.title = `${projectName} - Loop Log!`;
    } else {
      document.title = "Loop Log!";
    }
  }, [projectName]);

  if (isPopup) {
    return (
      <SidebarProvider>
        <StitchCounter />
      </SidebarProvider>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      <AppHeader />

      {projectName == null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <span className="opacity-50">
            Select or create a project to begin!
          </span>
          <ArrowLeft className="opacity-50"></ArrowLeft>
        </div>
      )}

      {projectName != null && (
        <div className="pt-8 px-8 md:px-16 grid grid-rows-[auto_1fr] gap-8 relative">
          <div className="flex-1 flex flex-col gap-8">
            <ProjectOverview />
            <h3 className="text-sm font-medium text-muted-foreground">
              Project Settings
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CounterSettings />
              <TimerSettings />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  window.open(
                    window.location.href,
                    "popup",
                    "width=400,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no"
                  );
                }}
              >
                Open Counter!
              </Button>
              {isFullscreen && (
                <p className="text-sm text-muted-foreground">
                  Note: While in fullscreen mode, the popup will open in a new tab instead of a popup window. You'll need to drag it out manually to create a separate window.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <AppContent />
      <InstagramCredit />
    </SidebarProvider>
  );
}

export default App;
