package models

import "time"

// Модель пользователя
type User struct {
	ID        int64     `db:"id" json:"id"`
	Email     string    `db:"email" json:"email"`
	Password  string    `db:"password_hash" json:"password"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// Модель курса
type Course struct {
	ID          int64     `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Description string    `db:"description" json:"description"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}

// Модель урока
type Lesson struct {
	ID        int64     `db:"id" json:"id"`
	CourseID  int64     `db:"course_id" json:"course_id"`
	Title     string    `db:"title" json:"title"`
	Content   string    `db:"content" json:"content"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// Модель задания
type Task struct {
	ID        int64     `db:"id" json:"id"`
	LessonID  int64     `db:"lesson_id" json:"lesson_id"`
	TaskType  string    `db:"task_type" json:"task_type"`
	Content   string    `db:"content" json:"content"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// Модель варианта задания
type TaskOption struct {
	ID        int64     `db:"id" json:"id"`
	TaskID    int64     `db:"task_id" json:"task_id"`
	Text      string    `db:"text" json:"text"`
	IsCorrect bool      `db:"is_correct" json:"is_correct"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
