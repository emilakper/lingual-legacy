package api

import (
	"database/sql"
	"fmt"
	"ling-leg-back/pkg/models"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetCourses - обработчик для GET /api/v1/courses
func GetCourses(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Выполнение SQL-запроса
		rows, err := db.Query("SELECT id, title, description, created_at FROM courses")
		if err != nil {
			log.Printf("Ошибка при получении курсов: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		defer rows.Close()

		// Обработка результатов запроса
		var courses []models.Course
		for rows.Next() {
			var course models.Course
			err := rows.Scan(&course.ID, &course.Title, &course.Description, &course.CreatedAt)
			if err != nil {
				log.Printf("Ошибка при сканировании курса: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}
			courses = append(courses, course)
		}

		// Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Список курсов",
			"courses": courses,
		})
	}
}

// GetCourse - обработчик для GET /api/v1/courses/:id
func GetCourseById(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получение ID курса из параметра запроса
		courseID, err := strconv.Atoi(c.Param("id")) // Преобразование строки в число
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID курса"})
			return
		}

		// Получение курса из базы данных
		var course models.Course
		err = db.QueryRow("SELECT id, title, description, created_at FROM courses WHERE id = $1", courseID).Scan(
			&course.ID, &course.Title, &course.Description, &course.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Курс не найден"})
				return
			}
			log.Printf("Ошибка при получении курса: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// Отправка ответа
		c.JSON(http.StatusOK, course)
	}
}

// GetCourseLessons - обработчик  для  GET  /api/v1/courses/:id/lessons
func GetCourseLessons(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  Получаем  ID  курса  из  параметров  URL
		courseID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  ID  курса"})
			return
		}

		//  Получение  уроков  курса  из  базы  данных
		rows, err := db.Query("SELECT  id,  course_id,  title,  content,  created_at  FROM  lessons  WHERE  course_id  =  $1", courseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка  при  получении  уроков:  %v", err)})
			return
		}
		defer rows.Close()

		var lessons []models.Lesson
		for rows.Next() {
			var lesson models.Lesson
			if err := rows.Scan(
				&lesson.ID,
				&lesson.CourseID,
				&lesson.Title,
				&lesson.Content,
				&lesson.CreatedAt,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка  при  сканировании  урока:  %v", err)})
				return
			}
			lessons = append(lessons, lesson)
		}

		c.JSON(http.StatusOK, lessons)
	}
}

// GetLessonByID - обработчик  для  GET  /api/v1/lessons/:id
func GetLessonByID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем  ID  урока  из  параметров  URL
		lessonID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID урока"})
			return
		}

		//  Получаем  данные  урока  из  базы  данных
		var lesson models.Lesson
		err = db.QueryRow("SELECT  id,  course_id,  title,  content, created_at  FROM  lessons  WHERE  id  =  $1", lessonID).Scan(
			&lesson.ID, &lesson.CourseID, &lesson.Title, &lesson.Content, &lesson.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Урок не найден"})
				return
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка  при  получении  урока: %v", err)})
				return
			}
		}

		c.JSON(http.StatusOK, lesson)
	}
}

// GetLessonTasks - обработчик для GET /api/v1/lessons/:id/tasks
func GetLessonTasks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем ID урока из параметров URL
		lessonID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID урока"})
			return
		}

		// Получаем данные ВСЕХ заданий из базы данных
		rows, err := db.Query("SELECT id, lesson_id, task_type, content, created_at FROM tasks WHERE lesson_id = $1", lessonID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при получении заданий: %v", err)})
			return
		}
		defer rows.Close()

		var tasks []models.Task
		for rows.Next() {
			var task models.Task
			if err := rows.Scan(&task.ID, &task.LessonID, &task.TaskType, &task.Content, &task.CreatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при сканировании задания: %v", err)})
				return
			}
			tasks = append(tasks, task)
		}

		// Формируем ответ
		tasksWithOptions := make([]map[string]interface{}, 0) // Слайс для заданий с вариантами ответов
		for _, task := range tasks {
			// Получаем варианты ответов для текущего задания
			var taskOptions []models.TaskOption
			optionsRows, err := db.Query("SELECT id, task_id, text, is_correct, created_at FROM task_options WHERE task_id = $1", task.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при получении вариантов ответа: %v", err)})
				return
			}
			defer optionsRows.Close()

			for optionsRows.Next() {
				var option models.TaskOption
				if err := optionsRows.Scan(
					&option.ID,
					&option.TaskID,
					&option.Text,
					&option.IsCorrect,
					&option.CreatedAt,
				); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при сканировании варианта ответа: %v", err)})
					return
				}
				taskOptions = append(taskOptions, option)
			}

			// Добавляем задание и его варианты ответов в ответ
			tasksWithOptions = append(tasksWithOptions, map[string]interface{}{
				"task":         task,
				"task_options": taskOptions,
			})
		}

		// Отправляем ответ с заданиями и вариантами ответов
		c.JSON(http.StatusOK, gin.H{
			"tasks": tasksWithOptions,
		})
	}
}

// CheckTaskAnswer - обработчик для POST /api/v1/tasks/:id/check
func CheckTaskAnswer(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем ID задания из параметров URL
		taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID задания"})
			return
		}

		// Получаем ID выбранного варианта ответа из тела запроса
		var requestBody struct {
			OptionID int64 `json:"option_id"`
		}
		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// Проверяем, является ли выбранный вариант ответа правильным для данного задания
		var isCorrect bool
		err = db.QueryRow("SELECT is_correct FROM task_options WHERE id = $1 AND task_id = $2", requestBody.OptionID, taskID).Scan(&isCorrect)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Вариант ответа не найден или не принадлежит этому заданию"})
				return
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при проверке ответа: %v", err)})
				return
			}
		}

		// Формируем ответ
		c.JSON(http.StatusOK, gin.H{
			"is_correct": isCorrect,
		})
	}
}
