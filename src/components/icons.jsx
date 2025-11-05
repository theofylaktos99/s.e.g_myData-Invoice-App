import React from 'react';

const baseIconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.8,
  stroke: 'currentColor',
};

export const InvoiceIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M7 3.5h6.5L18 8v11a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 19V5A1.5 1.5 0 017 3.5z" fill="currentColor" fillOpacity={0.08} />
    <path d="M13.5 3.25V7.5H18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 11.25h7" strokeLinecap="round" />
    <path d="M8.5 14.75h7" strokeLinecap="round" />
  </svg>
);

export const HistoryIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 12a5.5 5.5 0 015.5-5.5" strokeLinecap="round" />
  </svg>
);

export const WarningIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M12 4l7.5 13H4.5L12 4z" fill="currentColor" fillOpacity={0.08} />
    <path d="M12 8.5v4.5" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

export const SettingsIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.25 12a7.24 7.24 0 00-.09-1.16l1.57-1.22-1.5-2.6-1.91.57a7.21 7.21 0 00-2-.98l-.36-1.97h-3l-.37 1.97a7.21 7.21 0 00-2 .98l-1.9-.57-1.5 2.6 1.56 1.22A7.25 7.25 0 004.75 12c0 .39.03.78.09 1.16l-1.57 1.22 1.5 2.6 1.91-.57a7.21 7.21 0 002 .98l.37 1.97h3l.37-1.97a7.21 7.21 0 002-.98l1.9.57 1.5-2.6-1.56-1.22c.06-.38.09-.77.09-1.16z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckCircleIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M12 4.5a7.5 7.5 0 110 15 7.5 7.5 0 010-15z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.25 12.25l1.75 1.75 3.75-3.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloudFailIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M9 18.5a4.5 4.5 0 010-9 5.5 5.5 0 0110.5 1.32 3.75 3.75 0 01-1.12 7.18H9z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11v3.5" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

export const RevenueIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M4.5 7.5h15" strokeLinecap="round" />
    <path d="M6 10.5v6.5a1 1 0 001 1h2a1 1 0 001-1v-6.5" strokeLinecap="round" />
    <path d="M16 10.5v4.5a1 1 0 001 1h1a1 1 0 001-1v-4.5" strokeLinecap="round" />
    <path d="M10 13.25h3.5a1.5 1.5 0 001.5-1.5v-6.5A1.5 1.5 0 0013.5 3.75H10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DocumentStackIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M6.5 7.5h8.5L19 11v7.5a1 1 0 01-1 1H6.5a1 1 0 01-1-1V8.5a1 1 0 011-1z" fill="currentColor" fillOpacity={0.08} />
    <path d="M15 7.5V4.75a1 1 0 00-1-1H5.5a1 1 0 00-1 1v9.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12h5.5" strokeLinecap="round" />
    <path d="M9 14.75h5.5" strokeLinecap="round" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <circle cx="11" cy="11" r="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.5 15.5L20 20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FunnelIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M4 7h16" strokeLinecap="round" />
    <path d="M7 12h10" strokeLinecap="round" />
    <path d="M10 17h4" strokeLinecap="round" />
  </svg>
);

export const DownloadIcon = (props) => (
  <svg {...baseIconProps} {...props}>
    <path d="M12 4v9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.75 10.75L12 14l3.25-3.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19h14" strokeLinecap="round" />
  </svg>
);
