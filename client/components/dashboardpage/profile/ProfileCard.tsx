import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProfileCardProps {
  label: string;
  info: string | undefined;
  edit: boolean;
  className?: string | undefined;
  placeholder?: string | undefined;
  onChange?: (
    value: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options?: string[];
  suggestions?: string[]; 
  onSkillSelect?: (skill: string) => void;
  onSkillRemove?: (skill: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  label,
  info,
  edit,
  className,
  placeholder,
  onChange,
  options,
  suggestions,
  onSkillSelect,
  onSkillRemove
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      onSkillSelect?.(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className={cn(className)}>
      <p className="text-xs font-semibold">{label}</p>
      {label === "Skills" ? (
        <div className="mb-2">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            disabled={!edit}
            placeholder="Add a skill"
            className="mb-2"
          />
          {(suggestions ?? []).length > 0 && (
            <div className="border rounded shadow-lg max-h-48 overflow-y-auto">
              {(suggestions ?? []).map((skill) => (
                <div
                  key={skill}
                  onClick={() => {
                    onSkillSelect?.(skill);
                    setInputValue("");
                  }}
                  className="p-2 cursor-pointer hover:bg-slate-800"
                >
                  {skill}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.isArray(info) && info.map((skill) => (
              <div
              key={skill}
              className="flex items-center px-2 py-1 bg-gray-200 rounded"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => onSkillRemove?.(skill)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            ))}
          </div>
        </div>
      ) : label === "Blood Group" && options ? (
        <Select value={info as string} disabled={!edit} onValueChange={onChange}>
          <SelectTrigger className="disabled:cursor-default disabled:opacity-100 mb-2">
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={info as string}
          disabled={!edit}
          placeholder={placeholder}
          className="disabled:cursor-default disabled:opacity-100 mb-2"
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </div>
  );
};

export default ProfileCard;
