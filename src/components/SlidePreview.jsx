import React from "react";

const SlidePreview = ({ slides }) => {
  return (
    <div className="slide-grid">
      {slides.map((s, i) => (
        <div key={i} className="slide-card">
          <div className="slide-header">
            <span className="slide-num">Slide {i + 1}</span>
          </div>
          <h4>{s.title}</h4>
          <ul>
            {s.content.map((c, j) => (
              <li key={j}>{c}</li>
            ))}
          </ul>
          {s.notes && <p className="notes"><em>{s.notes}</em></p>}
        </div>
      ))}
    </div>
  );
};

export default SlidePreview;