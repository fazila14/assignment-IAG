import React from "react";

const SlidePreview = ({ slides }) => {
  return (
    <div className="slide-preview">
      {slides.map((s, i) => (
        <div key={i} className="slide-card">
          <h4>{s.title}</h4>
          <ul>
            {s.content.map((c, j) => (
              <li key={j}>{c}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SlidePreview;
