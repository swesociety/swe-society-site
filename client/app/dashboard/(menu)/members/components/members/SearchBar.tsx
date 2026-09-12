import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <Input
    placeholder="Search by name, email, or reg no..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="max-w-sm"
  />
);
