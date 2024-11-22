"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function Compare() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sample = searchParams.get("sample");
  const sampleUrl = `https://resume-comparsion.s3.eu-north-1.amazonaws.com/public/${sample}/document.docx`;

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [sampleTxtUrl, setSampleTxtUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    setUploadedFile({ name: file.name, type: file.type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sampleUrl", sampleUrl);

    setUploading(true);
    try {
      const response = await axios.post("/api/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        setUploadedDocument(response.data.convertedFileUrl || null);
        setUploadedPreview(response.data.convertedPreviewUrl || null);
        setSampleTxtUrl(response.data.sampleConvertedFileUrl || null);
      } else {
        throw new Error("No data in response");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleChangeDocument = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
  };

  const handleCompare = () => {
    if (!uploadedDocument) {
      alert("Please upload the document first.");
      return;
    }
    if (!sampleTxtUrl) {
      alert("Sample document conversion is not ready yet.");
      return;
    }
    router.push(`/result?sample=${sampleTxtUrl}&uploaded=${uploadedDocument}`);
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="h-dvh snap-y snap-mandatory overflow-auto bg-neutral-950 scrollbar-none p-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 w-full gap-5 h-full">
          <div className="w-full h-5/6">
            <h2 className="lg:text-lg font-semibold text-white mb-2">
              Sample Document
            </h2>
            <div className="border h-full w-full">
              <img
                src={`https://resume-comparsion.s3.eu-north-1.amazonaws.com/public/${sample}/preview.webp`}
                alt="Sample Preview"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="w-full h-5/6">
            <h2 className="lg:text-lg font-semibold text-white mb-2">
              Uploaded Document
            </h2>
            <div className="border h-full w-full flex justify-center items-center">
              {uploadedPreview === null && !uploading ? (
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="text-white w-full lg:w-1/2 rounded-md"
                />
              ) : uploading ? (
                <p className="lg:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
                  Uploading...
                </p>
              ) : (
                <img
                  src={uploadedPreview}
                  alt="Uploaded Preview"
                  className="w-full h-full"
                />
              )}
            </div>
            {uploadedPreview != null && (
              <button
                onClick={handleChangeDocument}
                className="w-full rounded-sm hover:border font-semibold lg:text-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 p-1 lg:p-2 mt-2"
              >
                Change Document
              </button>
            )}
          </div>

          <div className="w-full col-span-2 lg:col-span-1 lg:h-5/6 flex flex-col-reverse items-center justify-center gap-5 lg:gap-10">
            <div className="flex flex-col justify-center items-center gap-2 lg:gap-3 w-full">
              <p className="font-bold text-lg lg:text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 ">
                Detailed comparison by AI
              </p>
              <button
                className="flex justify-center items-center font-bold rounded-full p-2 bg-gradient-to-r from-blue-300 to-purple-300 border-indigo-500 border hover:scale-105 hover:border-2"
                onClick={handleCompare}
              >
                Compare
                <img src="/ai.png" className="w-10" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
