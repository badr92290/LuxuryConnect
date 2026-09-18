import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;

function base(children: React.ReactNode) {
  return function Icon(props: IconProps) {
    const { className = "", ...rest } = props;
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${className}`}
        {...rest}
      >
        {children}
      </svg>
    );
  };
}

export const IconInbox = base(
  <>
    <path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
    <path d="M5.5 6h13l2.5 6v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8l2.5-6Z" />
  </>
);

export const IconContacts = base(
  <>
    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    <circle cx="12" cy="10" r="2.4" />
    <path d="M8.2 16.4c.7-1.7 2-2.6 3.8-2.6s3.1.9 3.8 2.6" />
    <path d="M16.5 7.5h1.2M16.5 17h1.2" />
  </>
);

export const IconCalendar = base(
  <>
    <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </>
);

export const IconMessage = base(
  <>
    <path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4.6 3.5a.6.6 0 0 1-.96-.48V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />
  </>
);

export const IconUser = base(
  <>
    <circle cx="12" cy="8.2" r="3.4" />
    <path d="M5.2 20c1.1-3.4 3.5-5.1 6.8-5.1s5.7 1.7 6.8 5.1" />
  </>
);

export const IconPlus = base(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </>
);

export const IconList = base(
  <>
    <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" />
    <circle cx="4.2" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="4.2" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="4.2" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
  </>
);

export const IconArrowLeft = base(
  <>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </>
);

export const IconPhone = base(
  <path d="M6.6 3.5 9 6.2a1 1 0 0 1-.1 1.4L7.3 9.1a12.4 12.4 0 0 0 6.6 6.6l1.5-1.6a1 1 0 0 1 1.4-.1l2.7 2.4a1 1 0 0 1 .1 1.4l-1.5 1.7a1.6 1.6 0 0 1-1.5.5C10.7 19 5 13.3 3.4 7.5a1.6 1.6 0 0 1 .5-1.5l1.7-1.5a1 1 0 0 1 1-.1Z" />
);

export const IconMail = base(
  <>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4.5 7 12 12.5 19.5 7" />
  </>
);

export const IconLogout = base(
  <>
    <path d="M9 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h3" />
    <path d="M14 16l4-4-4-4" />
    <path d="M18 12H9" />
  </>
);

export const IconSearch = base(
  <>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="M20 20l-4.3-4.3" />
  </>
);

export const IconCrown = base(
  <path d="M4 8.5 8 12l4-6 4 6 4-3.5-1.6 9.5H5.6L4 8.5Z" strokeLinejoin="round" />
);
