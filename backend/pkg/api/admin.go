package api

import (
	"database/sql"
	"fmt"
	"ling-leg-back/pkg/models"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// RegisterAdminUser  -  обработчик  для  POST  /admin/auth/register
func RegisterAdminUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  данных  пользователя  из  запроса
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  формат  JSON"})
			return
		}

		//  2.  Хэширование  пароля
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Ошибка  при  хэшировании  пароля:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}
		user.Password = string(hashedPassword)

		//  3.  Сохранение  пользователя  в  базу  данных
		var userID int64 //  Переменная  для  ID  нового  пользователя
		sqlStatement := `
	  INSERT INTO users (email, password_hash, is_admin)
	  VALUES ($1, $2, true)
	  ON CONFLICT (email) DO NOTHING 
	  RETURNING id`
		err = db.QueryRow(sqlStatement, user.Email, user.Password).Scan(&userID)
		if err != nil {
			if pgErr, ok := err.(*pq.Error); ok && pgErr.Code.Name() == "unique_violation" {
				c.JSON(http.StatusConflict, gin.H{"error": "Пользователь  с  таким  email  уже  существует"})
				return
			}
			log.Printf("Ошибка  при  сохранении  пользователя:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  Если  регистрация  прошла  успешно,  то  userID  будет  установлен
		if userID == 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Пользователь  с  таким  email  уже  существует"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Пользователь  успешно  зарегистрирован",
			"user_id": userID,
		})
	}
}

// LoginAdminUser  -  обработчик  для  POST  /admin/auth/login
func LoginAdminUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  данных  для  входа  из  запроса
		var credentials struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&credentials); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  формат  JSON"})
			return
		}

		//  2.  Поиск  пользователя  по  email
		var user models.User
		err := db.QueryRow("SELECT * FROM  users  WHERE  email  =  $1  AND  is_admin  =  true", credentials.Email).Scan(
			&user.ID, &user.Email, &user.Password, &user.IsAdmin, &user.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный  email  или  пароль"})
				return
			}
			log.Printf("Ошибка  при  поиске  пользователя:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Сравнение  хэшей  паролей
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный  email  или  пароль"})
			return
		}

		//  4.  Генерация  JWT-токена
		expirationTime := time.Now().Add(24 * time.Hour)
		claims := &jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Subject:   strconv.FormatInt(user.ID, 10),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  при  генерации  токена"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Вход  выполнен  успешно",
			"token":   tokenString,
		})
	}
}

// GetAdminUsers - обработчик для GET /admin/users
func GetAdminUsers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Выполнение SQL-запроса
		rows, err := db.Query("SELECT id, email, is_admin, created_at FROM users")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		defer rows.Close()

		// Обработка результатов запроса
		var users []models.User
		for rows.Next() {
			var user models.User
			err := rows.Scan(&user.ID, &user.Email, &user.IsAdmin, &user.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}
			users = append(users, user)
		}

		userCount := len(users)

		// Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"users":     users,
			"userCount": userCount,
		})
	}
}

// CreateAdminUser - обработчик для POST /admin/users
func CreateAdminUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение данных пользователя из запроса
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 2. Проверка пароля
		if len(user.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Пароль должен содержать не менее 6 символов"})
			return
		}

		// 3. Хэширование пароля
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Ошибка при хэшировании пароля: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		user.Password = string(hashedPassword)

		// 4. Сохранение пользователя в базе данных
		var userID int64
		sqlStatement := `
	  INSERT INTO users (email, password_hash, is_admin)
	  VALUES ($1, $2, $3)
	  ON CONFLICT (email) DO NOTHING 
	  RETURNING id`
		err = db.QueryRow(sqlStatement, user.Email, user.Password, user.IsAdmin).Scan(&userID)
		if err != nil {
			if pgErr, ok := err.(*pq.Error); ok && pgErr.Code.Name() == "unique_violation" {
				fmt.Println(user)
				c.JSON(http.StatusConflict, gin.H{"error": "Пользователь с таким email уже существует"})
				return
			}
			log.Printf("Ошибка при сохранении пользователя: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 5. Отправка ответа
		c.JSON(http.StatusCreated, gin.H{
			"message": "Пользователь успешно создан",
			"user_id": userID,
		})
	}
}

// UpdateAdminUser - обработчик для PUT /admin/users/:id
func UpdateAdminUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID пользователя из параметров URL
		userID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
			return
		}

		// 2. Получение данных пользователя из запроса
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 3. Проверка пароля
		if user.Password != "" && len(user.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Пароль должен быть не менее 6 символов"})
			return
		}
		var passwordHash interface{}
		if user.Password != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Ошибка при хэшировании пароля: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}
			passwordHash = string(hashedPassword)
		} else {
			passwordHash = sql.NullString{}
		}

		// 4. Обновление данных пользователя в базе данных
		sqlStatement := `
		UPDATE users 
		SET email = $1, 
		    password_hash = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE password_hash END, 
		    is_admin = $3
		WHERE id = $4`
		_, err = db.Exec(sqlStatement, user.Email, passwordHash, user.IsAdmin, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 5. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Пользователь успешно обновлен",
		})
	}
}

// DeleteAdminUser - обработчик для DELETE /admin/users/:id
func DeleteAdminUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID пользователя из параметров URL
		userID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
			return
		}

		// 2. Удаление пользователя из базы данных
		sqlStatement := `DELETE FROM users WHERE id = $1`
		_, err = db.Exec(sqlStatement, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 3. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Пользователь успешно удален",
		})
	}
}

// GetAdminCourses  -  обработчик  для  GET  /admin/courses
func GetAdminCourses(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  Выполнение  SQL-запроса
		rows, err := db.Query("SELECT  id,  title,  description,  created_at  FROM  courses")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}
		defer rows.Close()

		//  Обработка  результатов  запроса
		var courses []models.Course
		for rows.Next() {
			var course models.Course
			err := rows.Scan(&course.ID, &course.Title, &course.Description, &course.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
				return
			}
			courses = append(courses, course)
		}

		coursesCount := len(courses)

		//  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"courses":      courses,
			"coursesCount": coursesCount,
		})
	}
}

// CreateAdminCourse  -  обработчик  для  POST  /admin/courses
func CreateAdminCourse(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  данных  курса  из  запроса
		var course models.Course
		if err := c.ShouldBindJSON(&course); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  формат  JSON"})
			return
		}

		//  2.  Сохранение  курса  в  базу  данных
		var courseID int64 //  Переменная  для  ID  нового  курса
		sqlStatement := `
		INSERT INTO courses (title, description)
		VALUES ($1, $2)
		RETURNING id`
		err := db.QueryRow(sqlStatement, course.Title, course.Description).Scan(&courseID)
		if err != nil {
			log.Printf("Ошибка  при  сохранении  курса:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusCreated, gin.H{
			"message":   "Курс  успешно  создан",
			"course_id": courseID,
		})
	}
}

// UpdateAdminCourse  -  обработчик  для  PUT  /admin/courses/:id
func UpdateAdminCourse(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID курса из параметров URL
		courseID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID курса"})
			return
		}

		// 2. Получение данных курса из запроса
		var course models.Course
		if err := c.ShouldBindJSON(&course); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 3. Обновление данных курса в базе данных
		sqlStatement := `
		UPDATE courses 
		SET title = COALESCE($1, title), 
		    description = COALESCE($2, description) 
		WHERE id = $3`
		_, err = db.Exec(sqlStatement, course.Title, course.Description, courseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 4. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Курс успешно обновлен",
		})
	}
}

// DeleteAdminCourse  -  обработчик  для  DELETE  /admin/courses/:id
func DeleteAdminCourse(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  ID  курса  из  параметров  URL
		courseID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  ID  курса"})
			return
		}

		//  2.  Удаление  курса  из  базы  данных
		sqlStatement := `DELETE FROM courses WHERE id = $1`
		_, err = db.Exec(sqlStatement, courseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Курс  успешно  удален",
		})
	}
}

// GetAdminLessons  -  обработчик  для  GET  /admin/lessons
func GetAdminLessons(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  Выполнение  SQL-запроса
		rows, err := db.Query("SELECT  id,  course_id,  title,  content,  created_at  FROM  lessons")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}
		defer rows.Close()

		//  Обработка  результатов  запроса
		var lessons []models.Lesson
		for rows.Next() {
			var lesson models.Lesson
			err := rows.Scan(&lesson.ID, &lesson.CourseID, &lesson.Title, &lesson.Content, &lesson.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
				return
			}
			lessons = append(lessons, lesson)
		}

		lessonsCount := len(lessons)

		//  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"lessons":      lessons,
			"lessonsCount": lessonsCount,
		})
	}
}

// CreateAdminLesson  -  обработчик  для  POST  /admin/lessons
func CreateAdminLesson(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  данных  урока  из  запроса
		var lesson models.Lesson
		if err := c.ShouldBindJSON(&lesson); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  формат  JSON"})
			return
		}

		// Вывод полученных данных для отладки
		fmt.Printf("Полученный урок: %+v\n", lesson)

		//  2.  Сохранение  урока  в  базу  данных
		var lessonID int64 //  Переменная  для  ID  нового  урока
		sqlStatement := `
		INSERT INTO lessons (course_id, title, content)
		VALUES ($1, $2, $3)
		RETURNING id`
		err := db.QueryRow(sqlStatement, lesson.CourseID, lesson.Title, lesson.Content).Scan(&lessonID)
		if err != nil {
			log.Printf("Ошибка  при  сохранении  урока:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusCreated, gin.H{
			"message":   "Урок  успешно  создан",
			"lesson_id": lessonID,
		})
	}
}

// UpdateAdminLesson  -  обработчик  для  PUT  /admin/lessons/:id
func UpdateAdminLesson(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID урока из параметров URL
		lessonID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID урока"})
			return
		}

		// 2. Получение данных урока из запроса
		var lesson models.Lesson
		if err := c.ShouldBindJSON(&lesson); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 3. Обновление данных урока в базе данных
		sqlStatement := `
		UPDATE lessons 
		SET course_id = COALESCE($1, course_id), 
		    title = COALESCE($2, title), 
		    content = COALESCE($3, content) 
		WHERE id = $4`
		_, err = db.Exec(sqlStatement, lesson.CourseID, lesson.Title, lesson.Content, lessonID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 4. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Урок успешно обновлен",
		})
	}
}

// DeleteAdminLesson  -  обработчик  для  DELETE  /admin/lessons/:id
func DeleteAdminLesson(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  ID  урока  из  параметров  URL
		lessonID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  ID  урока"})
			return
		}

		//  2.  Удаление  урока  из  базы  данных
		sqlStatement := `DELETE FROM lessons WHERE id = $1`
		_, err = db.Exec(sqlStatement, lessonID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Урок  успешно  удален",
		})
	}
}

// GetAdminTasks  -  обработчик  для  GET  /admin/tasks
func GetAdminTasks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  Выполнение  SQL-запроса
		rows, err := db.Query("SELECT  id,  lesson_id,  task_type,  content,  created_at  FROM  tasks")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}
		defer rows.Close()

		//  Обработка  результатов  запроса
		var tasks []models.Task
		for rows.Next() {
			var task models.Task
			err := rows.Scan(&task.ID, &task.LessonID, &task.TaskType, &task.Content, &task.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
				return
			}
			tasks = append(tasks, task)
		}

		tasksCount := len(tasks)

		//  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"tasks":      tasks,
			"tasksCount": tasksCount,
		})
	}
}

// CreateAdminTask  -  обработчик  для  POST  /admin/tasks
func CreateAdminTask(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  данных  задания  из  запроса
		var task models.Task
		if err := c.ShouldBindJSON(&task); err != nil {
			fmt.Println("Ошибка при разборе JSON:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  формат  JSON"})
			return
		}

		//  2.  Сохранение  задания  в  базу  данных
		var taskID int64 //  Переменная  для  ID  нового  задания
		sqlStatement := `
		INSERT INTO tasks (lesson_id, task_type, content)
		VALUES ($1, $2, $3)
		RETURNING id`
		err := db.QueryRow(sqlStatement, task.LessonID, task.TaskType, task.Content).Scan(&taskID)
		if err != nil {
			log.Printf("Ошибка  при  сохранении  задания:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusCreated, gin.H{
			"message": "Задание  успешно  создан",
			"task_id": taskID,
		})
	}
}

// UpdateAdminTask  -  обработчик  для  PUT  /admin/tasks/:id
func UpdateAdminTask(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID задания из параметров URL
		taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID задания"})
			return
		}

		// 2. Получение данных задания из запроса
		var task models.Task
		if err := c.ShouldBindJSON(&task); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 3. Обновление данных задания в базе данных
		sqlStatement := `
		UPDATE tasks 
		SET lesson_id = COALESCE($1, lesson_id), 
		    task_type = COALESCE($2, task_type), 
		    content = COALESCE($3, content) 
		WHERE id = $4`
		_, err = db.Exec(sqlStatement, task.LessonID, task.TaskType, task.Content, taskID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 4. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Задание успешно обновлено",
		})
	}
}

// DeleteAdminTask  -  обработчик  для  DELETE  /admin/tasks/:id
func DeleteAdminTask(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  ID  задания  из  параметров  URL
		taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  ID  задания"})
			return
		}

		//  2.  Удаление  задания  из  базы  данных
		sqlStatement := `DELETE FROM tasks WHERE id = $1`
		_, err = db.Exec(sqlStatement, taskID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Задание  успешно  удален",
		})
	}
}

// GetAdminTaskOptions  -  обработчик  для  GET  /admin/task_options
func GetAdminTaskOptions(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  Выполнение  SQL-запроса
		rows, err := db.Query("SELECT  id,  task_id,  text,  is_correct,  created_at  FROM  task_options")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}
		defer rows.Close()

		//  Обработка  результатов  запроса
		var taskOptions []models.TaskOption
		for rows.Next() {
			var taskOption models.TaskOption
			err := rows.Scan(&taskOption.ID, &taskOption.TaskID, &taskOption.Text, &taskOption.IsCorrect, &taskOption.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
				return
			}
			taskOptions = append(taskOptions, taskOption)
		}

		taskOptionsCount := len(taskOptions)

		//  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"task_options":      taskOptions,
			"task_optionsCount": taskOptionsCount,
		})
	}
}

// GetTaskOptionsByTaskID - обработчик для GET /admin/task_options/task/:task_id
func GetTaskOptionsByTaskID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение task_id из параметров URL
		taskID, err := strconv.ParseInt(c.Param("task_id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный task_id"})
			return
		}

		// 2. Выполнение SQL-запроса
		rows, err := db.Query("SELECT id, task_id, text, is_correct, created_at FROM task_options WHERE task_id = $1", taskID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		defer rows.Close()

		// 3. Обработка результатов запроса
		var taskOptions []models.TaskOption
		for rows.Next() {
			var taskOption models.TaskOption
			err := rows.Scan(&taskOption.ID, &taskOption.TaskID, &taskOption.Text, &taskOption.IsCorrect, &taskOption.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}
			taskOptions = append(taskOptions, taskOption)
		}

		taskOptionsCount := len(taskOptions)

		// 4. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"task_options":      taskOptions,
			"task_optionsCount": taskOptionsCount,
		})
	}
}

// CreateAdminTaskOption  -  обработчик  для  POST  /admin/task_options
func CreateAdminTaskOption(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  данных  варианта  ответа  из  запроса
		var taskOption models.TaskOption
		if err := c.ShouldBindJSON(&taskOption); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  формат  JSON"})
			return
		}

		//  2.  Сохранение  варианта  ответа  в  базу  данных
		var taskOptionID int64 //  Переменная  для  ID  нового  варианта  ответа
		sqlStatement := `
		INSERT INTO task_options (task_id, text, is_correct)
		VALUES ($1, $2, $3)
		RETURNING id`
		err := db.QueryRow(sqlStatement, taskOption.TaskID, taskOption.Text, taskOption.IsCorrect).Scan(&taskOptionID)
		if err != nil {
			log.Printf("Ошибка  при  сохранении  варианта  ответа:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusCreated, gin.H{
			"message":        "Вариант  ответа  успешно  создан",
			"task_option_id": taskOptionID,
		})
	}
}

// UpdateAdminTaskOption  -  обработчик  для  PUT  /admin/task_options/:id
func UpdateAdminTaskOption(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID варианта ответа из параметров URL
		taskOptionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID варианта ответа"})
			return
		}

		// 2. Получение данных варианта ответа из запроса
		var taskOption models.TaskOption
		if err := c.ShouldBindJSON(&taskOption); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 3. Обновление данных варианта ответа в базе данных
		sqlStatement := `
		UPDATE task_options 
		SET task_id = COALESCE($1, task_id), 
		    text = COALESCE($2, text), 
		    is_correct = COALESCE($3, is_correct) 
		WHERE id = $4`
		_, err = db.Exec(sqlStatement, taskOption.TaskID, taskOption.Text, taskOption.IsCorrect, taskOptionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 4. Отправка ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Вариант ответа успешно обновлен",
		})
	}
}

// DeleteAdminTaskOption  -  обработчик  для  DELETE  /admin/task_options/:id
func DeleteAdminTaskOption(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  1.  Получение  ID  варианта  ответа  из  параметров  URL
		taskOptionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный  ID  варианта  ответа"})
			return
		}

		//  2.  Удаление  варианта  ответа  из  базы  данных
		sqlStatement := `DELETE FROM task_options WHERE id = $1`
		_, err = db.Exec(sqlStatement, taskOptionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		//  3.  Отправка  ответа
		c.JSON(http.StatusOK, gin.H{
			"message": "Вариант  ответа  успешно  удален",
		})
	}
}
