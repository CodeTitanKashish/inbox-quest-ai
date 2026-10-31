import React, { createContext, useContext, useState } from 'react';

interface AnnouncerContextType {
  announce: (message: string) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType>({
  announce: () => {}
});

export const AriaAnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');

  const announce = (msg: string) => {
    setMessage(msg);
  };

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {message}
      </div>
    </AnnouncerContext.Provider>
  );
};

export const useAnnounce = () => useContext(AnnouncerContext);
