import React from 'react';

interface HtmlContentProps {
  content: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content }) => {
  return (
    <div
      className="custom-html"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default HtmlContent;
