import React from "react";
import { Upload, Trash2, CircleCheckBig } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Progress } from "@/src/components/ui/progress";
import { useZipFileUpload } from "@/src/hooks/useZipFileUpload";

interface ProductZipUploaderProps {
  zipUploadHook: ReturnType<typeof useZipFileUpload>;
  productName: string;
}

export const ProductZipUploader: React.FC<ProductZipUploaderProps> = ({
  zipUploadHook,
  productName,
}) => {
  const {
    productZip,
    isUploadingZip,
    uploadProgress,
    uploadedZipPath,
    showZipUpload,
    handleZipUpload,
    uploadZipFileToBunny,
    handleRemoveExistingZip,
  } = zipUploadHook;

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground" htmlFor="zip_file_name">
        Zip File
      </Label>
      <div className="col-span-3 space-y-2">
        {!showZipUpload && uploadedZipPath && (
          <div className="flex items-center justify-between">
            <span className="text-sm">{uploadedZipPath}</span>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={handleRemoveExistingZip}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Replace Zip
            </Button>
          </div>
        )}

        {(showZipUpload || !uploadedZipPath) && (
          <div className="flex gap-2">
            <Input
              accept=".zip"
              disabled={isUploadingZip || !!uploadedZipPath}
              id="productZip"
              type="file"
              onChange={handleZipUpload}
            />
            {productZip && !uploadedZipPath && (
              <Button
                className="whitespace-nowrap"
                disabled={isUploadingZip}
                type="button"
                onClick={() => uploadZipFileToBunny(productName)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Zip
              </Button>
            )}
          </div>
        )}

        {isUploadingZip && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress className="h-2" value={uploadProgress} />
          </div>
        )}

        {uploadedZipPath && !isUploadingZip && !showZipUpload && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CircleCheckBig size={16} />
            File uploaded successfully
          </p>
        )}
      </div>
    </div>
  );
};
