import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideLink, Plus, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditProjectProps {
  projects: string[] | null;
  edit?: boolean;
  onChange?: (projects: string[]) => void;
  className?: string;
}

const EditProject: React.FC<EditProjectProps> = ({
  projects = [],
  edit = false,
  onChange,
  className
}) => {
  const [newProject, setNewProject] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddProject = () => {
    if (!newProject.trim()) {
      setError("Please enter a project URL");
      return;
    }

    if (!validateUrl(newProject)) {
      setError("Please enter a valid URL");
      return;
    }

    if (projects?.includes(newProject)) {
      setError("This project URL already exists");
      return;
    }

    const updatedProjects = [...(projects || []), newProject];
    onChange?.(updatedProjects);
    setNewProject("");
    setShowInput(false);
    setError("");
  };

  const handleRemoveProject = (projectToRemove: string) => {
    const updatedProjects = projects?.filter(project => project !== projectToRemove) || [];
    onChange?.(updatedProjects);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProject();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewProject("");
      setError("");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Projects</p>
        {edit && !showInput && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowInput(true)}
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {edit && showInput && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newProject}
              onChange={(e) => {
                setNewProject(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyPress}
              placeholder="Enter project URL"
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddProject}
            >
              Add
            </Button>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {projects && projects.length > 0 ? (
          projects.map((project, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-md bg-accent/50 group"
            >
              <LucideLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              
              <a 
                href={project}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground hover:underline truncate flex-grow"
              >
                {project}
                <ExternalLink className="h-3 w-3 inline ml-1 opacity-50" />
              </a>

              {edit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveProject(project)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No projects added yet</p>
        )}
      </div>
    </div>
  );
};

export default EditProject;
