export default function DemandPackageBuilderIcon() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        {/* Main circular container */}
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl">
          {/* Icon content */}
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Document base */}
            <path
              d="M40 20 C40 15 42 12 47 12 L95 12 L120 37 L120 140 C120 145 118 148 113 148 L47 148 C42 148 40 145 40 140 Z"
              fill="white"
              opacity="0.95"
            />
            
            {/* Folded corner */}
            <path
              d="M95 12 L95 32 C95 35 97 37 100 37 L120 37 L95 12 Z"
              fill="white"
              opacity="0.7"
            />
            
            {/* Building blocks/sections - representing different sections */}
            {/* Block 1 - Intro */}
            <rect
              x="52"
              y="45"
              width="56"
              height="12"
              rx="2"
              fill="#3B82F6"
              opacity="0.85"
            />
            
            {/* Block 2 - Liability/Facts */}
            <rect
              x="52"
              y="62"
              width="56"
              height="12"
              rx="2"
              fill="#3B82F6"
              opacity="0.7"
            />
            
            {/* Block 3 - Medical */}
            <rect
              x="52"
              y="79"
              width="56"
              height="12"
              rx="2"
              fill="#3B82F6"
              opacity="0.55"
            />
            
            {/* Block 4 - Damages */}
            <rect
              x="52"
              y="96"
              width="56"
              height="12"
              rx="2"
              fill="#3B82F6"
              opacity="0.4"
            />
            
            {/* Block 5 - Exhibits */}
            <rect
              x="52"
              y="113"
              width="56"
              height="12"
              rx="2"
              fill="#3B82F6"
              opacity="0.25"
            />
            
            {/* Construction/Builder tools icon overlay */}
            <g transform="translate(100, 105)">
              {/* Wrench/Tool circle background */}
              <circle cx="18" cy="18" r="18" fill="#1E40AF" />
              
              {/* Wrench icon */}
              <path
                d="M18 10 L18 14 M18 14 L22 14 L22 22 L14 22 L14 14 L18 14 M14 22 L14 26 M22 22 L22 26"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              
              {/* Small gear detail */}
              <circle cx="18" cy="18" r="3" stroke="white" strokeWidth="1.5" fill="none" />
            </g>
            
            {/* Checkmark badge - representing evidence grounding */}
            <g transform="translate(35, 18)">
              <circle cx="8" cy="8" r="8" fill="#10B981" />
              <path
                d="M5 8 L7 10 L11 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          </svg>
        </div>
        
        {/* Label */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl text-gray-900 mb-2">
            Demand Package Builder
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Orchestrates your end-to-end demand packet using prebuilt playbooks, 
            prompts, and automations—assembling every section with strict evidence grounding.
          </p>
        </div>
      </div>
    </div>
  );
}
