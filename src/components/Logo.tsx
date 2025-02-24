import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <circle cx="16" cy="16" r="15" stroke="#42b983" strokeWidth="2" fill="white" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="#42b983"
          fontSize="18"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ¥
        </text>
      </svg>
    </div>
  );
};

export default Logo; 