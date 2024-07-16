package api

import (
	"database/sql"
	"ling-leg-back/pkg/models"
	"log"
	"net/http"

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
