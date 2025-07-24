import { useProjects } from "@/hooks/useProjects";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { PlusIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectSearch } from "./ProjectSearch";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const SidebarBullet = ({ projectID }: { projectID: string }) => {
  const { state } = useSidebar();
  const { selectedProjectID, setSelectedProjectID, deleteProject } = useProjects();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const projectName = useProjects((state) => state.projects[projectID]?.name);
  const projectColor = useProjects((state) => state.projects[projectID]?.color);

  return (
    <AnimatePresence initial={false}>
      {state == "expanded" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SidebarMenuItem>
            <div
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <SidebarMenuButton
                asChild
                onClick={() => {
                  setSelectedProjectID(projectID);
                }}
                className={
                  selectedProjectID == projectID ? `bg-sidebar-accent` : ``
                }
              >
                <div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: projectColor,
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <span>{projectName}</span>
                </div>
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
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{projectName}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => {
                            deleteProject(projectID);
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const AppSidebar = () => {
  const { projects, createNewProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  const recentProjects = Object.entries(projects)
    .filter(([, project]) => Date.now() - project.lastModified < ONE_WEEK)
    .sort((a, b) => b[1].lastModified - a[1].lastModified);

  const oldProjects = Object.entries(projects)
    .filter(([, project]) => Date.now() - project.lastModified >= ONE_WEEK)
    .sort((a, b) => b[1].lastModified - a[1].lastModified);

  const filteredRecentProjects = searchQuery
    ? recentProjects.filter(([, project]) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : recentProjects;

  const filteredOldProjects = searchQuery
    ? oldProjects.filter(([, project]) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : oldProjects;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row ^group-data-[collapsible=icon]:gap-2">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="h-2 group-data-[collapsible=icon]:hidden"
        />
        <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
          <h2 className="font-semibold truncate overflow-hidden whitespace-nowrap">
            Loop Log!
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={createNewProject}>
                  <div>
                    <PlusIcon></PlusIcon>
                    <span>New Project</span>
                  </div>
                </SidebarMenuButton>

                <ProjectSearch onSearch={setSearchQuery} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AnimatePresence mode="popLayout">
                {filteredRecentProjects.length > 0 &&
                  filteredRecentProjects.map(([key]) => (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.15,
                        layout: { duration: 0.2 },
                      }}
                    >
                      <SidebarBullet projectID={key} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/*  Old Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Old Projects</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <AnimatePresence mode="popLayout">
                {filteredOldProjects.length > 0 &&
                  filteredOldProjects.map(([key]) => (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.15,
                        layout: { duration: 0.2 },
                      }}
                    >
                      <SidebarBullet projectID={key} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
