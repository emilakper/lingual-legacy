import React, { useState } from 'react';

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="text-lg font-bold cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <span className="float-right">
          {isOpen ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </h3>
      <div className={`transition-all duration-300 ease-in-out max-h-0 overflow-hidden ${isOpen ? 'max-h-screen' : ''}`}>
        {isOpen && (
          <p className="text-gray-600 mt-2">{answer}</p>
        )}
      </div>
    </div>
  );
}

export default FaqItem;

