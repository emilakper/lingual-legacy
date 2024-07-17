CREATE TABLE users (
         id         SERIAL PRIMARY KEY,
         email      VARCHAR(255) UNIQUE NOT NULL,
         password_hash TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

CREATE TABLE courses (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id         SERIAL PRIMARY KEY,
    course_id  INTEGER REFERENCES courses(id),
    title      VARCHAR(255) NOT NULL,
    content   TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id         SERIAL PRIMARY KEY,
    lesson_id  INTEGER REFERENCES lessons(id),
    task_type  VARCHAR(255) NOT NULL,
    content   TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE  TABLE  task_options (
  id        SERIAL  PRIMARY  KEY,
  task_id   INTEGER  REFERENCES  tasks(id)  ON  DELETE  CASCADE, 
  text      TEXT  NOT  NULL,
  is_correct BOOLEAN  NOT  NULL  DEFAULT  FALSE,
  created_at TIMESTAMP  NOT  NULL  DEFAULT  NOW()
);