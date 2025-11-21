import B2 from 'backblaze-b2';
import path from 'path';

class BackblazeService {
    private b2: B2;
    private bucketId: string | null = null;
    private bucketName: string;
    private authToken: string | null = null;
    private downloadUrl: string | null = null;
    private authTokenExpiry: number = 0;

    constructor() {
        const keyId = process.env.B2_KEY_ID || process.env.keyID;
        const appKey = process.env.B2_APPLICATION_KEY || process.env.applicationKey;

        this.b2 = new B2({
            applicationKeyId: keyId!,
            applicationKey: appKey!,
        });
        this.bucketName = process.env.B2_BUCKET_NAME || 'gemij-ahamed';
    }

    /**
     * Authorize with Backblaze B2 and cache the auth token
     */
    private async authorize(): Promise<void> {
        try {
            // Check if we have a valid cached token
            if (this.authToken && Date.now() < this.authTokenExpiry) {
                return;
            }

            const response = await this.b2.authorize();
            this.authToken = response.data.authorizationToken;
            this.downloadUrl = response.data.downloadUrl;

            // Set expiry to 23 hours (tokens are valid for 24 hours)
            this.authTokenExpiry = Date.now() + (23 * 60 * 60 * 1000);

            // Get bucket ID if not cached
            if (!this.bucketId) {
                const bucketsResponse = await this.b2.listBuckets(); // Remove bucketName arg if not supported

                const bucket = bucketsResponse.data.buckets.find(
                    (b: any) => b.bucketName === this.bucketName
                );

                if (!bucket) {
                    throw new Error(`Bucket ${this.bucketName} not found`);
                }

                this.bucketId = bucket.bucketId;
            }
        } catch (error) {
            console.error('B2 Authorization error:', error);
            throw new Error('Failed to authorize with Backblaze B2');
        }
    }

    /**
     * Upload a file to Backblaze B2
     * @param fileBuffer - File buffer to upload
     * @param fileName - Name to save the file as
     * @param mimeType - MIME type of the file
     * @returns File ID and URL
     */
    async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        mimeType: string = 'application/octet-stream'
    ): Promise<{ fileId: string; fileName: string; url: string }> {
        try {
            await this.authorize();

            // Get upload URL
            const uploadUrlResponse = await this.b2.getUploadUrl({
                bucketId: this.bucketId!,
            });

            const uploadUrl = uploadUrlResponse.data.uploadUrl;
            const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

            // Generate a unique file name to avoid collisions
            const timestamp = Date.now();
            const randomSuffix = Math.round(Math.random() * 1E9);
            const ext = path.extname(fileName);
            const baseName = path.basename(fileName, ext);
            const uniqueFileName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;

            // Upload the file
            const uploadResponse = await this.b2.uploadFile({
                uploadUrl,
                uploadAuthToken,
                fileName: uniqueFileName,
                data: fileBuffer,
                mime: mimeType,
            });

            const fileId = uploadResponse.data.fileId;
            const url = `${this.downloadUrl}/file/${this.bucketName}/${uniqueFileName}`;

            return {
                fileId,
                fileName: uniqueFileName,
                url,
            };
        } catch (error) {
            console.error('B2 Upload error:', error);
            throw new Error('Failed to upload file to Backblaze B2');
        }
    }

    /**
     * Delete a file from Backblaze B2
     * @param fileName - Name of the file to delete
     * @param fileId - File ID from B2
     */
    async deleteFile(fileName: string, fileId: string): Promise<void> {
        try {
            await this.authorize();

            await this.b2.deleteFileVersion({
                fileId,
                fileName,
            });
        } catch (error) {
            console.error('B2 Delete error:', error);
            throw new Error('Failed to delete file from Backblaze B2');
        }
    }

    /**
     * Get a download URL for a file
     * @param fileName - Name of the file
     * @returns Download URL
     */
    async getFileUrl(fileName: string): Promise<string> {
        try {
            await this.authorize();
            return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;
        } catch (error) {
            console.error('B2 Get URL error:', error);
            throw new Error('Failed to get file URL from Backblaze B2');
        }
    }

    /**
     * Get a temporary authorized download URL (for private buckets)
     * @param fileName - Name of the file
     * @param validDurationInSeconds - How long the URL should be valid (default: 1 hour)
     * @returns Authorized download URL
     */
    async getAuthorizedDownloadUrl(
        fileName: string,
        validDurationInSeconds: number = 3600
    ): Promise<string> {
        try {
            await this.authorize();

            const response = await this.b2.getDownloadAuthorization({
                bucketId: this.bucketId!,
                fileNamePrefix: fileName,
                validDurationInSeconds,
            });

            const authToken = response.data.authorizationToken;
            return `${this.downloadUrl}/file/${this.bucketName}/${fileName}?Authorization=${authToken}`;
        } catch (error) {
            console.error('B2 Get authorized URL error:', error);
            throw new Error('Failed to get authorized download URL from Backblaze B2');
        }
    }

    /**
     * Download a file from Backblaze B2
     * @param fileName - Name of the file to download
     * @returns File buffer
     */
    async downloadFile(fileName: string): Promise<Buffer> {
        try {
            await this.authorize();

            const response = await this.b2.downloadFileByName({
                bucketName: this.bucketName,
                fileName,
                responseType: 'arraybuffer'
            });

            return Buffer.from(response.data);
        } catch (error) {
            console.error('B2 Download error:', error);
            throw new Error('Failed to download file from Backblaze B2');
        }
    }
}

// Export a singleton instance
export const backblazeService = new BackblazeService();
