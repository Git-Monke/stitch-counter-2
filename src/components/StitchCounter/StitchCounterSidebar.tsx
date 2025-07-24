import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
  useSelectedProject,
  useSelectedSectionID,
} from "../../hooks/useProjects";
import { PlusIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

const SectionItem = ({ 
  sectionID, 
  section, 
  selectedSectionID, 
  onSectionSwitch, 
  onDeleteSection 
}: { 
  sectionID: string; 
  section: { name: string }; 
  selectedSectionID: string | null; 
  onSectionSwitch: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}) => {
  const { toggleSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <SidebarMenuItem>
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarMenuButton
          onClick={() => {
            if (sectionID !== selectedSectionID) {
              onSectionSwitch(sectionID);
              toggleSidebar();
            }
          }}
          className={
            selectedSectionID === sectionID ? "bg-sidebar-accent" : ""
          }
        >
          <span>{section.name}</span>
        </SidebarMenuButton>
        <AnimatePresence>
          {isHovered && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Section</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{section.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      onDeleteSection(sectionID);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </AnimatePresence>
      </div>
    </SidebarMenuItem>
  );
};

interface StitchCounterSidebarProps {
  onSectionSwitch: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
}

/**
 * Sidebar for selecting sections within the StitchCounter popup.
 * Uses Zustand for state management and shadcn/ui for UI primitives.
 */
export const StitchCounterSidebar: React.FC<StitchCounterSidebarProps> = ({ onSectionSwitch, onAddSection, onDeleteSection }) => {
  const project = useSelectedProject();
  const selectedSectionID = useSelectedSectionID();
  const { toggleSidebar } = useSidebar();

  if (!project) {
    return null;
  }

  const sectionEntries = Object.entries(project.data.sections);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row ^group-data-[collapsible=icon]:gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-2" />
        <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
          <h2 className="font-semibold truncate overflow-hidden whitespace-nowrap">
            Select Section
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sectionEntries.map(([sectionID, section]) => (
                <SectionItem
                  key={sectionID}
                  sectionID={sectionID}
                  section={section}
                  selectedSectionID={selectedSectionID}
                  onSectionSwitch={onSectionSwitch}
                  onDeleteSection={onDeleteSection}
                />
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    onAddSection();
                    toggleSidebar();
                  }}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Section
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
