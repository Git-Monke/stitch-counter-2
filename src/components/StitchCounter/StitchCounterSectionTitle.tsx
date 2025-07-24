import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, X } from "lucide-react";
import {
  useSelectedProject,
  useSelectedSectionID,
  useProjects,
  useSelectedProjectID,
} from "../../hooks/useProjects";

/**
 * Displays and allows editing of the current section's name.
 * Uses Zustand hooks internally for state management.
 */
interface StitchCounterSectionTitleProps {
  editing: boolean;
  setEditing: (editing: boolean) => void;
}

export const StitchCounterSectionTitle: React.FC<
  StitchCounterSectionTitleProps
> = ({ editing, setEditing }) => {
  const project = useSelectedProject();
  const selectedSectionID = useSelectedSectionID();
  const selectedProjectID = useSelectedProjectID();
  const renameSection = useProjects((state) => state.renameSection);

  const sectionName =
    selectedSectionID && project.data.sections[selectedSectionID]
      ? project.data.sections[selectedSectionID].name
      : "No section selected";

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editingStartTime = useRef<number | null>(null);

  // When editing becomes true, clear the input and focus/select it
  useEffect(() => {
    if (editing) {
      setInputValue("");
      editingStartTime.current = Date.now();

      // Aggressive focus strategy with multiple attempts
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("Focus attempt made");
        }
      };

      // Immediate attempt
      focusInput();

      // Multiple delayed attempts to ensure focus
      setTimeout(focusInput, 0);
      setTimeout(focusInput, 50);
      setTimeout(focusInput, 1000);
    }
  }, [editing]);

  // Cancel editing on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Prevent premature blur by checking elapsed time since editing started
    const elapsedTime = editingStartTime.current
      ? Date.now() - editingStartTime.current
      : null;

    if (elapsedTime !== null && elapsedTime < 300) {
      if (inputRef.current) {
        inputRef.current.focus(); // Refocus the input
      }
      return;
    }

    // Only cancel if focus moves outside the input and the buttons
    if (
      e.relatedTarget &&
      (e.relatedTarget as HTMLElement).dataset.action === "check"
    ) {
      return;
    }
    setEditing(false);
  };

  // Submit the name change
  const handleSubmit = () => {
    if (
      project &&
      selectedSectionID &&
      inputValue.trim() &&
      inputValue !== project.data.sections[selectedSectionID]?.name
    ) {
      renameSection(selectedProjectID, selectedSectionID, inputValue.trim());
    }
    setEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <div className="relative flex items-center gap-1 min-w-0 truncate focus-within:z-10">
      {editing ? (
        <>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            className="truncate text-base h-8 px-2 py-1 w-auto max-w-[8rem] sm:max-w-[12rem]"
            style={{ fontSize: "inherit" }}
            autoFocus
          />
          <Button
            type="button"
            data-action="check"
            size="icon"
            variant="ghost"
            className="ml-1 text-green-600 hover:text-green-800 flex-shrink-0"
            onClick={handleSubmit}
            tabIndex={0}
          >
            <Check className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-1 text-red-600 hover:text-red-800 flex-shrink-0"
            onClick={handleCancel}
            tabIndex={0}
          >
            <X className="w-5 h-5" />
          </Button>
        </>
      ) : (
        <>
          <span 
            className="truncate cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setInputValue(sectionName);
              setEditing(true);
            }}
          >
            {sectionName}
          </span>
        </>
      )}
    </div>
  );
};
