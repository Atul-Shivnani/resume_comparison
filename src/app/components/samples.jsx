"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

const Samples = () => {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const templates = [
    { name: "Template 0", folder: "template0" },
    { name: "Template 1", folder: "template1" },
    { name: "Template 2", folder: "template2" },
    { name: "Template 3", folder: "template3" },
    { name: "Template 4", folder: "template4" },
    { name: "Template 5", folder: "template5" },
    { name: "Template 6", folder: "template6" },
    { name: "Template 7", folder: "template7" },
    { name: "Template 8", folder: "template8" },
    { name: "Template 9", folder: "template9" },
    { name: "Template 10", folder: "template10" },
    { name: "Template 11", folder: "template11" },
    { name: "Template 12", folder: "template12" },
  ];

  const handleView = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true); // Open modal to view template
  };

  const handleSelect = (template) => {
    router.push(`/compare?sample=${template.folder}`)
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="relative snap-center h-full p-2 lg:p-10 m-1" id="choose-template">
      <span className="bg-neutral-950 absolute p-1 -top-1 lg:top-4 left-4 lg:left-20 z-10">
        <h1 className="lg:text-3xl text-xl font-bold bg-gradient-to-tl from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Choose Template
        </h1>
      </span>

      <div className="w-full h-full p-1 bg-gradient-to-tl from-blue-500 to-purple-500">
        <div className="w-full h-full py-5 lg:px-3 p-2 bg-neutral-950 overflow-hidden">
          <div className="grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 w-full h-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-indigo-500 overflow-y-auto">
            {templates.map((template, index) => (
              <div key={index} className="lg:p-5 p-2">
                <div className="relative group bg-neutral-400">
                  <img
                    src={`https://resume-comparsion.s3.eu-north-1.amazonaws.com/public/${template.folder}/preview.webp`}
                    alt={template.name}
                    className="w-full"
                  />
                  <div className="lg:absolute bottom-0 w-full bg-neutral-500 bg-opacity-0 group-hover:bg-opacity-40 flex gap-2 justify-around p-1 lg:p-5">
                    <button
                      onClick={() => handleView(template)}
                      className="text-md bg-gradient-to-l from-blue-500 to-purple-500 rounded-full lg:text-lg p-1 lg:p-2 text-white hover:scale-105 duration-200 lg:w-2/5 lg:hidden group-hover:block"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSelect(template)}
                      className="text-md bg-gradient-to-l from-blue-500 to-purple-500 rounded-full lg:text-lg p-1 lg:p-2 text-white hover:scale-105 duration-200 lg:w-2/5 lg:hidden group-hover:block"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for viewing template preview */}
      {isModalOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{selectedTemplate.name}</h2>
            <img
              src={`https://resume-comparsion.s3.eu-north-1.amazonaws.com/public/${selectedTemplate.folder}/preview.webp`}
              alt={selectedTemplate.name}
              className="w-full mb-4 border"
            />
            <button
              onClick={closeModal}
              className="bg-gradient-to-l from-blue-500 to-purple-500 text-white rounded-full px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Samples;
