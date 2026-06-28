CREATE TABLE IF NOT EXISTS t_p72415923_admin_panel_text_set.step_documents (
  id SERIAL PRIMARY KEY,
  step_id VARCHAR(50) NOT NULL,
  doc_label VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);