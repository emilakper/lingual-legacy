package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"ling-leg-back/pkg/api"
	"ling-leg-back/pkg/models"

	"github.com/gin-contrib/cors"
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

	// Настройка CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Версия API
	v1 := router.Group("/api/v1")
	{
		v1.GET("/courses", api.GetCourses(db))
		v1.GET("/courses/:id", api.GetCourseById(db))
		v1.POST("/auth/register", api.RegisterUser(db))
		v1.POST("/auth/login", api.LoginUser(db))

		// Защищенные пути
		v1.GET("/courses/:id/lessons", api.JWTAuthMiddleware(), api.GetCourseLessons(db))
		v1.GET("/lessons/:id", api.JWTAuthMiddleware(), api.GetLessonByID(db))
		v1.GET("/users/me", api.JWTAuthMiddleware(), api.GetUser(db))
		v1.GET("/lessons/:id/tasks", api.JWTAuthMiddleware(), api.GetLessonTasks(db))
		v1.POST("/tasks/:id/check", api.JWTAuthMiddleware(), api.CheckTaskAnswer(db))
	}

	//  Регистрация  администратора  (POST  /admin/auth/register)
	router.POST("/admin/auth/register", api.RegisterAdminUser(db))

	//  Авторизация  администратора  (POST  /admin/auth/login)
	router.POST("/admin/auth/login", api.LoginAdminUser(db))

	//  Защищенные  пути  для  административной  панели
	admin := router.Group("/admin")
	{
		//  Администратор  -  данные  пользователей
		admin.GET("/users", api.JWTAuthMiddleware(), api.GetAdminUsers(db))
		admin.POST("/users", api.JWTAuthMiddleware(), api.CreateAdminUser(db))
		admin.PUT("/users/:id", api.JWTAuthMiddleware(), api.UpdateAdminUser(db))
		admin.DELETE("/users/:id", api.JWTAuthMiddleware(), api.DeleteAdminUser(db))

		//  Администратор  -  данные  курсов
		admin.GET("/courses", api.JWTAuthMiddleware(), api.GetAdminCourses(db))
		admin.POST("/courses", api.JWTAuthMiddleware(), api.CreateAdminCourse(db))
		admin.PUT("/courses/:id", api.JWTAuthMiddleware(), api.UpdateAdminCourse(db))
		admin.DELETE("/courses/:id", api.JWTAuthMiddleware(), api.DeleteAdminCourse(db))

		//  Администратор  -  данные  уроков
		admin.GET("/lessons", api.JWTAuthMiddleware(), api.GetAdminLessons(db))
		admin.POST("/lessons", api.JWTAuthMiddleware(), api.CreateAdminLesson(db))
		admin.PUT("/lessons/:id", api.JWTAuthMiddleware(), api.UpdateAdminLesson(db))
		admin.DELETE("/lessons/:id", api.JWTAuthMiddleware(), api.DeleteAdminLesson(db))

		//  Администратор  -  данные  заданий
		admin.GET("/tasks", api.JWTAuthMiddleware(), api.GetAdminTasks(db))
		admin.POST("/tasks", api.JWTAuthMiddleware(), api.CreateAdminTask(db))
		admin.PUT("/tasks/:id", api.JWTAuthMiddleware(), api.UpdateAdminTask(db))
		admin.DELETE("/tasks/:id", api.JWTAuthMiddleware(), api.DeleteAdminTask(db))

		//  Администратор  -  данные  вариантов  ответов
		admin.GET("/task_options", api.JWTAuthMiddleware(), api.GetAdminTaskOptions(db))
		admin.POST("/task_options", api.JWTAuthMiddleware(), api.CreateAdminTaskOption(db))
		admin.PUT("/task_options/:id", api.JWTAuthMiddleware(), api.UpdateAdminTaskOption(db))
		admin.DELETE("/task_options/:id", api.JWTAuthMiddleware(), api.DeleteAdminTaskOption(db))
		admin.GET("/task_options/task/:task_id", api.JWTAuthMiddleware(), api.GetTaskOptionsByTaskID(db))
		admin.GET("/users/chart", api.JWTAuthMiddleware(), api.GetAdminUsersChart(db))
	}

	router.Run(":8081")
}
