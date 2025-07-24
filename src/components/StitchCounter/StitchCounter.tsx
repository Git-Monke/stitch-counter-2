import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
  useSelectedProject,
  useProjects,
  useSelectedSectionID,
  useSelectedProjectID,
} from "../../hooks/useProjects";
import { StitchCounterSidebar } from "./StitchCounterSidebar";
import { StitchCounterSectionTitle } from "./StitchCounterSectionTitle";
import { DataPointCounter } from "./DataPointCounter";
import { SectionTimer } from "./SectionTimer";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

import { useSelectedProjectName } from "../../hooks/useProjects";
import { Toaster } from "../ui/sonner";

export const StitchCounter: React.FC = () => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [editingSection, setEditingSection] = useState(false);
  const project = useSelectedProject();
  const projectName = useSelectedProjectName();
  const projectId = useSelectedProjectID();
  const zustandRehydrate = useProjects.persist.rehydrate;
  const sectionId = useSelectedSectionID();
  const updateSelectedProject = useProjects(
    (state) => state.updateSelectedProject,
  );
  const deleteSection = useProjects((state) => state.deleteSection);

  const activeCounters = project?.options?.counterOptions
    ? [
        project.options.counterOptions.stitches,
        project.options.counterOptions.rows,
        project.options.counterOptions.repeats,
      ].filter(Boolean).length
    : 0;

  const handleEditNotes = () => {
    if (!sectionId || !project) return;
    setNotesDraft(project.data.sections[sectionId].notes);
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    if (!sectionId) return;
    updateSelectedProject("data", (data) => ({
      ...data,
      sections: {
        ...data.sections,
        [sectionId]: {
          ...data.sections[sectionId],
          notes: notesDraft,
        },
      },
    }));
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setIsEditingNotes(false);
    setNotesDraft("");
  };

  const handleDeleteSection = () => {
    if (sectionId && projectId) {
      deleteSection(projectId, sectionId);
    }
  };

  const handleSectionSwitch = (newSectionId: string) => {
    // Save notes if currently editing
    if (isEditingNotes) {
      handleSaveNotes();
    }
    
    // Switch to the new section
    if (projectId) {
      useProjects.getState().setSelectedSection(projectId, newSectionId);
    }
  };

  const handleAddSection = () => {
    // Save notes if currently editing
    if (isEditingNotes) {
      handleSaveNotes();
    }
    
    // Add new section (which will auto-select it)
    if (projectId) {
      useProjects.getState().addSectionToProject(projectId);
    }
  };

  const handleDeleteSectionFromSidebar = (sectionIdToDelete: string) => {
    // Save notes if currently editing and it's the same section being deleted
    if (isEditingNotes && sectionIdToDelete === sectionId) {
      handleSaveNotes();
    }
    
    // Delete the section
    if (projectId) {
      deleteSection(projectId, sectionIdToDelete);
    }
  };

  // Set document title to project name, update dynamically
  useEffect(() => {
    if (projectName) {
      document.title = projectName;
    }
  }, [projectName]);

  // --- Real-time cross-window sync logic ---
  // 1. Listen for storage and message events to reload Zustand state
  useEffect(() => {
    const handleSync = () => {
      // Rehydrate Zustand from localStorage
      if (typeof zustandRehydrate === "function") {
        zustandRehydrate();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data === "stitch-counter-sync") {
        handleSync();
      }
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("message", handleMessage);
    };
  }, [zustandRehydrate]);

  // 2. Send postMessage to opener (main) or popup (child) on relevant updates
  // We'll patch the persist setItem to also send a message
  useEffect(() => {
    // Only patch once
    if ((window as any).__stitchCounterPatched) return;
    (window as any).__stitchCounterPatched = true;

    const origSetItem = window.localStorage.setItem;
    window.localStorage.setItem = function (...args) {
      origSetItem.apply(this, args);
      // Notify the other window (popup or main)
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage("stitch-counter-sync", "*");
      }
      // If this is the main window and popup is open, notify it
      if (
        (window as any).__stitchCounterPopup &&
        !(window as any).__stitchCounterPopup.closed
      ) {
        (window as any).__stitchCounterPopup.postMessage(
          "stitch-counter-sync",
          "*",
        );
      }
    };

    // If this is the main window, track the popup when opened
    const origOpen = window.open;
    window.open = function (...args) {
      const popup = origOpen.apply(this, args);
      (window as any).__stitchCounterPopup = popup;
      return popup;
    };
  }, []);

  if (!project) {
    return <div className="p-4">No project selected.</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <StitchCounterSidebar onSectionSwitch={handleSectionSwitch} onAddSection={handleAddSection} onDeleteSection={handleDeleteSectionFromSidebar} />
      <div className="flex-1 p-4 flex flex-col">
        {/* Main stitch counter content goes here */}
        <div className="flex items-center gap-1 min-w-0 justify-between">
          <div className="flex items-center gap-1">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4 mx-1" />
            <h2 className="text-lg font-bold flex items-center gap-1 min-w-0 truncate">
              <StitchCounterSectionTitle
                editing={editingSection}
                setEditing={setEditingSection}
              />
            </h2>
          </div>
          {sectionId && (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 flex items-center justify-center">
                <Pencil className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setEditingSection(true)}>
                  <Pencil />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDeleteSection}
                >
                  <Trash />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
          {!isEditingNotes && (
            <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-4">
              <div className="grid gap-4">
                {project.options?.counterOptions?.time && sectionId && (
                  <div className="w-full">
                    <SectionTimer />
                  </div>
                )}
                <div
                  className={`grid gap-4 ${
                    activeCounters === 1
                      ? "grid-cols-1"
                      : activeCounters === 2
                        ? "grid-cols-2"
                        : "grid-cols-1"
                  }`}
                >
                  {project.options?.counterOptions?.stitches && (
                    <DataPointCounter
                      dataKey="stitches"
                      label="Stitches"
                      compact={activeCounters === 3}
                    />
                  )}
                  {project.options?.counterOptions?.rows && (
                    <DataPointCounter
                      dataKey="rows"
                      label="Rows"
                      compact={activeCounters === 3}
                    />
                  )}
                  {project.options?.counterOptions?.repeats && (
                    <DataPointCounter
                      dataKey="repeats"
                      label="Repeats"
                      compact={activeCounters === 3}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {isEditingNotes ? (
            <div className="flex flex-col gap-4 flex-1 min-h-0 mt-4">
              <Textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                className="resize-none w-full flex-1 min-h-0"
                placeholder="Enter your notes here..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    handleSaveNotes();
                  }
                }}
                autoFocus={true}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancelNotes}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes}>Save Notes</Button>
              </div>
            </div>
          ) : (
            sectionId && (
              <div className="flex justify-end mt-auto">
                <Button onClick={handleEditNotes} variant="outline">
                  Edit Notes
                </Button>
              </div>
            )
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default StitchCounter;
