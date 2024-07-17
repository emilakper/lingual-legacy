package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"ling-leg-back/pkg/api"
	"ling-leg-back/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Загрузка переменных окружения из .env
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Ошибка при загрузке .env: %v", err)
	}

	// Получение пароля из переменных окружения
	dbPassword := os.Getenv("DB_PASSWORD")

	// Строка подключения к PostgreSQL
	connStr := fmt.Sprintf("postgres://lingua_legacy_user:%s@localhost/lingua_legacy?sslmode=disable", dbPassword)

	// Подключение к базе данных
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Ошибка подключения к базе данных: %v", err)
	}
	defer db.Close()

	// Проверка подключения
	err = db.Ping()
	if err != nil {
		log.Fatalf("Ошибка пинга базы данных: %v", err)
	}

	fmt.Println("Успешное подключение к базе данных!")

	// Пример получения данных из базы данных
	rows, err := db.Query("SELECT id, title, description, created_at FROM courses")
	if err != nil {
		log.Fatalf("Ошибка при получении курсов: %v", err)
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		err = rows.Scan(&course.ID, &course.Title, &course.Description, &course.CreatedAt)
		if err != nil {
			log.Fatalf("Ошибка при сканировании курса: %v", err)
		}
		courses = append(courses, course)
	}

	fmt.Println("Список курсов:")
	for _, course := range courses {
		fmt.Printf("- %s\n", course.Title)
	}

	// Инициализация роутера Gin
	router := gin.Default()

	// Версия API
	v1 := router.Group("/api/v1")
	{
		v1.GET("/courses", api.GetCourses(db))
		v1.GET("/courses/:id", api.GetCourse(db))
		v1.POST("/auth/register", api.RegisterUser(db))
	}

	router.Run(":8081")
}
