import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { APIENDPOINTS } from '@/data/urls';
import { headerConfig } from '@/lib/header_config';

interface Skill {
  skill_id: number;
  skill: string;
  area: string;
}

interface SkillManagementProps {
  selectedSkills: string[];
  edit: boolean;
  onChange?: (skills: string[]) => void;
  className?: string;
}

const SkillManagement: React.FC<SkillManagementProps> = ({
  selectedSkills = [],
  edit = false,
  onChange,
  className
}) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [skills, setSkills] = useState<string[]>(selectedSkills);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (input.length > 0) {
      const fetchSuggestions = async () => {
        try {
        
        const response = await axios.get(APIENDPOINTS.skill.getAllSkill, headerConfig());
          const filteredSuggestions = response.data.filter((skill: Skill) =>
            skill.skill.toLowerCase().includes(input.toLowerCase())
          );
          setSuggestions(filteredSuggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching skills:", error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleAddSkill = (skill: string) => {
    if (!skills.includes(skill) && skill.trim() !== "") {
      const updatedSkills = [...skills, skill];
      setSkills(updatedSkills);
      onChange?.(updatedSkills);
      setInput("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    onChange?.(updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      handleAddSkill(input.trim());
    }
  };

  return (
    <div className={cn("relative", className)}>
      <p className="text-xs font-semibold">Skills</p>
      {edit && (
        <div className="relative mb-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add a skill..."
            className="disabled:cursor-default disabled:opacity-100"
          />
          {input.trim() && showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {/* Show current input as a custom skill option */}
              {!suggestions.some(s => s.skill.toLowerCase() === input.toLowerCase()) && (
                <div
                  className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center border-b"
                  onClick={() => handleAddSkill(input.trim())}
                >
                  <span>{input}</span>
                  <span className="text-xs text-muted-foreground">Add custom skill</span>
                </div>
              )}
              {/* Show API suggestions */}
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.skill_id}
                  className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center"
                  onClick={() => handleAddSkill(suggestion.skill)}
                >
                  <span>{suggestion.skill}</span>
                  <span className="text-xs text-muted-foreground">{suggestion.area}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
            >
              {skill}
              {edit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

export default SkillManagement;
