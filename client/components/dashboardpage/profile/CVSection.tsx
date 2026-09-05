import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAssetsToCloud } from "@/utils/ImageUploadService";

interface CVSectionProps {
  cv: string | null;
  edit?: boolean;
  onUpload?: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

const CVSection: React.FC<CVSectionProps> = ({
  cv,
  edit = false,
  onUpload,
  onRemove,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadedURL = await uploadAssetsToCloud(file);
        onUpload?.(uploadedURL);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold">CV</p>

      <div className="flex items-center gap-2">
        {cv ? (
          <>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={cv} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
                View CV
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>

            {edit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={onRemove}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </>
            )}
          </>
        ) : edit ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload CV
                  <span className="text-xs text-muted-foreground ml-2">
                    (PDF only)
                  </span>
                </>
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No CV uploaded</p>
        )}
      </div>
    </div>
  );
};

export default CVSection;
