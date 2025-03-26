import Image from "next/image";

type Download = {
  id: string;
  productId: string;
  productName: string;
  coverImage: string;
  downloadUrl: string;
  purchasedAt: Date | string;
  expiresAt?: Date | string;
  downloadCount: number;
};

interface DownloadsListProps {
  downloads: Download[];
}

export function DownloadsList({ downloads }: DownloadsListProps) {
  const handleDownload = (downloadUrl: string, productName: string) => {
    // Implement actual download logic here
    console.log(`Downloading ${productName} from ${downloadUrl}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {downloads.map((download) => (
        <div
          key={download.id}
          className="border rounded-md overflow-hidden flex flex-col"
        >
          <div className="relative h-48 w-full">
            {download.coverImage ? (
              <Image
                fill
                alt={download.productName}
                className="object-cover"
                src={download.coverImage}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  No image
                </span>
              </div>
            )}
          </div>

          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {download.productName}
            </h3>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <p>
                Purchased: {new Date(download.purchasedAt).toLocaleDateString()}
              </p>
              {download.expiresAt && (
                <p>
                  Expires: {new Date(download.expiresAt).toLocaleDateString()}
                </p>
              )}
              <p>Downloads: {download.downloadCount}</p>
            </div>
          </div>

          <div className="p-4 border-t">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              onClick={() =>
                handleDownload(download.downloadUrl, download.productName)
              }
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
