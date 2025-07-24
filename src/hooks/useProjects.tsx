import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";
import { templateProject } from "./projectTemplates";

interface StitchTypes {
  stitches: number;
  rows: number;
  repeats: number;
  time: number;
}

interface Section {
  name: string;
  notes: string; // markdown string
  data: StitchTypes;
}

interface ProjectData {
  sections: Record<string, Section>;
}

interface ProjectOptions {
  counterOptions: {
    stitches: boolean;
    rows: boolean;
    repeats: boolean;
    time: boolean;
  };
  timerOptions: {
    remindTurnOn: boolean;
    autoTurnOff: boolean;
    remindTurnOnDelay: number;
    autoTurnOffDelay: number;
  };
}

export interface Project {
  options: ProjectOptions;
  data: ProjectData;
  name: string;
  color: string;
  lastModified: number;
  selectedSectionID: string;
}

interface ProjectStore {
  // Base state
  projects: Record<string, Project>;
  selectedProjectID: string;

  // Actions
  setSelectedProjectID: (newProject: string) => void;
  createNewProject: () => void;
  deleteProject: (projectID: string) => void;
  renameProject: (projectID: string, newName: string) => void;
  updateSelectedProject: <K extends keyof Project>(
    key: K,
    updateFunc: (data: Project[K]) => Project[K]
  ) => void;
  setSelectedSection: (projectID: string, sectionID: string) => void;
  addSectionToProject: (projectID: string) => void;
  renameSection: (
    projectID: string,
    sectionID: string,
    newName: string
  ) => void;
  deleteSection: (projectID: string, sectionID: string) => void;
}

const randomID = () => Math.random().toString(36).slice(2, 11);

export const useProjects = create<ProjectStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // Initial state
        projects: {},
        selectedProjectID: "",

        // Actions
        setSelectedProjectID: (newProject) => {
          set({ selectedProjectID: newProject });
        },

        setSelectedSection: (projectID, sectionID) => {
          set((state) => ({
            projects: {
              ...state.projects,
              [projectID]: {
                ...state.projects[projectID],
                selectedSectionID: sectionID,
                lastModified: Date.now(),
              },
            },
          }));
        },

        createNewProject: () => {
          const projectID = randomID();
          const newProject: Project = { ...templateProject };
          newProject.lastModified = Date.now();

          // Pick the first section as default selected, if any
          const firstSectionID = Object.keys(newProject.data.sections)[0] || "";
          newProject.selectedSectionID = firstSectionID;

          set((state) => ({
            projects: {
              ...state.projects,
              [projectID]: newProject,
            },
            selectedProjectID: projectID,
          }));
        },

        addSectionToProject: (projectID) => {
          set((state) => {
            const project = state.projects[projectID];
            if (!project) return state;

            // Generate a unique section key
            const newSectionID = Math.random().toString(36).slice(2, 11);
            const newSection = {
              name: "Untitled Section",
              notes: "",
              data: {
                stitches: 0,
                rows: 0,
                repeats: 0,
                time: 0,
              },
            };

            return {
              projects: {
                ...state.projects,
                [projectID]: {
                  ...project,
                  data: {
                    ...project.data,
                    sections: {
                      ...project.data.sections,
                      [newSectionID]: newSection,
                    },
                  },
                  selectedSectionID: newSectionID,
                  lastModified: Date.now(),
                },
              },
            };
          });
        },

        renameSection: (projectID, sectionID, newName) => {
          set((state) => {
            const project = state.projects[projectID];
            if (!project) return state;
            const section = project.data.sections[sectionID];
            if (!section) return state;

            return {
              projects: {
                ...state.projects,
                [projectID]: {
                  ...project,
                  data: {
                    ...project.data,
                    sections: {
                      ...project.data.sections,
                      [sectionID]: {
                        ...section,
                        name: newName,
                      },
                    },
                  },
                  lastModified: Date.now(),
                },
              },
            };
          });
        },

        deleteSection: (projectID, sectionID) => {
          set((state) => {
            const project = state.projects[projectID];
            if (!project) return state;
            if (!project.data.sections[sectionID]) return state;

            // Create new sections object without the deleted section
            const newSections = { ...project.data.sections };
            delete newSections[sectionID];

            // Get remaining section IDs
            const remainingSectionIDs = Object.keys(newSections);

            // Select the first available section, or none if there are no sections left
            const newSelectedSectionID =
              remainingSectionIDs.length > 0 ? remainingSectionIDs[0] : "";

            return {
              projects: {
                ...state.projects,
                [projectID]: {
                  ...project,
                  data: {
                    ...project.data,
                    sections: newSections,
                  },
                  selectedSectionID: newSelectedSectionID,
                  lastModified: Date.now(),
                },
              },
            };
          });
        },

        deleteProject: (projectID) => {
          set((state) => {
            const newProjects = { ...state.projects };
            delete newProjects[projectID];

            // Clear selection if we're deleting the selected project
            const newState: Partial<ProjectStore> = {
              projects: newProjects,
            };
            if (state.selectedProjectID === projectID) {
              newState.selectedProjectID = "";
            }

            return newState;
          });
        },

        renameProject: (projectID, newName) => {
          set((state) => ({
            projects: {
              ...state.projects,
              [projectID]: {
                ...state.projects[projectID],
                name: newName,
                lastModified: Date.now(),
              },
            },
          }));
        },

        updateSelectedProject: (key, updateFunc) => {
          set((state) => {
            const selectedProjectID = state.selectedProjectID;
            if (!selectedProjectID) return state;

            const updatedProject = {
              ...state.projects[selectedProjectID],
              [key]: updateFunc(state.projects[selectedProjectID][key]),
              lastModified: Date.now(),
            };

            return {
              projects: {
                ...state.projects,
                [selectedProjectID]: updatedProject,
              },
            };
          });
        },
      }),
      {
        name: "stitch-counter-storage",
        partialize: (state) => ({
          projects: state.projects,
          selectedProjectID: state.selectedProjectID,
        }),
      }
    )
  )
);

// --- Cross-window sync: listen for storage and message events and rehydrate store ---
if (typeof window !== "undefined") {
  const rehydrate = () => {
    if (typeof useProjects.persist?.rehydrate === "function") {
      useProjects.persist.rehydrate();
    }
  };

  window.addEventListener("storage", rehydrate);
  window.addEventListener("message", (event) => {
    if (event.data === "stitch-counter-sync") {
      rehydrate();
    }
  });
}

// Selector helpers
export const useSelectedProject = () =>
  useProjects((state) => state.projects[state.selectedProjectID] || null);

export const useSelectedProjectID = () =>
  useProjects((state) => state.selectedProjectID);

export const useSelectedSectionID = () =>
  useProjects(
    (state) =>
      state.projects[state.selectedProjectID]?.selectedSectionID || null
  );

export const createSelectedProjectSelector =
  <K extends keyof Project>(key: K) =>
  (state: ProjectStore) =>
    state.projects[state.selectedProjectID]?.[key];

// Common selectors
export const useSelectedProjectOption = <K extends keyof Project["options"]>(
  optionType: K,
  prop: keyof Project["options"][K]
) => {
  return useProjects(
    (state) =>
      state.projects[state.selectedProjectID]?.options[optionType][prop]
  );
};

export const useSelectedProjectName = () => {
  return useProjects((state) => state.projects[state.selectedProjectID]?.name);
};
