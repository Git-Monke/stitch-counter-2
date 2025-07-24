import { useProjects, useSelectedProjectName } from "@/hooks/useProjects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Check, Settings, PaintBucket, Pencil, Trash, X } from "lucide-react";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HexColorPicker } from "react-colorful";
import { SidebarTrigger } from "./ui/sidebar";

const ColorPickerPopover = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const { updateSelectedProject } = useProjects();
  const selectedColor = useProjects(
    (state) => state.projects[state.selectedProjectID]?.color ?? "#000000"
  );

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          <PaintBucket className="mr-2" />
          Change Color
        </DropdownMenuItem>
      </PopoverTrigger>
      <PopoverContent className="flex">
        <HexColorPicker
          color={selectedColor}
          onChange={(newHex) => {
            updateSelectedProject("color", () => newHex);
          }}
          className="flex-1"
        />
      </PopoverContent>
    </Popover>
  );
};

export const AppHeader = () => {
  const {
    renameProject,
    deleteProject,
    selectedProjectID,
    updateSelectedProject,
  } = useProjects();
  const projectName = useSelectedProjectName();
  const projectColor = useProjects(
    (state) => state.projects[state.selectedProjectID]?.color
  );

  const [renamingProject, setRenamingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const exitRename = () => {
    setNewProjectName("");
    setRenamingProject(false);
  };

  const nameIsValid = (name: string): boolean => {
    return name != "";
  };

  const handleRename = () => {
    if (!nameIsValid(newProjectName)) {
      return;
    }

    renameProject(selectedProjectID, newProjectName);
    setNewProjectName("");
    setRenamingProject(false);
  };

  return (
    <>
      {projectName != null && (
        <div className="h-16 flex items-end px-8 md:px-16 w-full justify-between">
          {/* SidebarTrigger: far left, only on mobile */}
          <div className="flex items-center flex-1">
            <div className="md:hidden mr-3">
              <SidebarTrigger />
            </div>
            <div className="flex items-center h-10">
              <Popover
                open={colorPickerOpen && !renamingProject}
                onOpenChange={setColorPickerOpen}
              >
                <PopoverTrigger asChild>
                  <div
                    className={`w-3 h-3 rounded-full mr-3 transition-transform ${
                      !renamingProject
                        ? "cursor-pointer hover:scale-110"
                        : "cursor-default"
                    }`}
                    style={{
                      backgroundColor: projectColor,
                    }}
                    onClick={() => {
                      if (!renamingProject) {
                        setColorPickerOpen(true);
                      }
                    }}
                  />
                </PopoverTrigger>
                <PopoverContent className="flex">
                  <HexColorPicker
                    color={projectColor || "#000000"}
                    onChange={(newHex) => {
                      updateSelectedProject("color", () => newHex);
                    }}
                    className="flex-1"
                  />
                </PopoverContent>
              </Popover>
              {!renamingProject && (
                <span
                  className="mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setNewProjectName(projectName || "");
                    setRenamingProject(true);
                  }}
                >
                  {projectName || "No project selected"}
                </span>
              )}
              {renamingProject && (
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="New name..."
                    onBlur={exitRename}
                    autoFocus={true}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.key == "Enter") {
                        handleRename();
                      }
                    }}
                    value={newProjectName}
                    onChange={(e) => {
                      setNewProjectName(e.target.value);
                    }}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    className={`${
                      !nameIsValid(newProjectName) && "opacity-50"
                    }`}
                    disabled={!nameIsValid(newProjectName)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRename();
                    }}
                  >
                    <Check size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={exitRename}>
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`h-10 flex items-center justify-center ${
                renamingProject ? "opacity-50 cursor-default" : ""
              }`}
              disabled={renamingProject}
            >
              <Pencil className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Rename */}
              <DropdownMenuItem
                onClick={() => {
                  setRenamingProject(true);
                }}
              >
                <Pencil></Pencil>
                Rename
              </DropdownMenuItem>

              {/* Change Color */}
              <ColorPickerPopover />

              {/* Delete */}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  deleteProject(selectedProjectID);
                }}
              >
                <Trash></Trash>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
};
