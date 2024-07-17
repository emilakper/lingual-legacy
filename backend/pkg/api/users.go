package api

import (
	"database/sql"
	"log"
	"net/http"
	"regexp"

	"ling-leg-back/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// RegisterUser - обработчик для POST /api/v1/auth/register
func RegisterUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение данных пользователя из запроса
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 2. Валидация данных пользователя (email, пароль)
		if !isValidEmail(user.Email) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат email"})
			return
		}

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
		var userID int64 // Переменная для ID нового пользователя
		sqlStatement := `
			INSERT INTO users (email, password_hash)
			VALUES ($1, $2)
			ON CONFLICT (email) DO NOTHING 
			RETURNING id`
		err = db.QueryRow(sqlStatement, user.Email, user.Password).Scan(&userID)
		if err != nil {
			if pgErr, ok := err.(*pq.Error); ok && pgErr.Code.Name() == "unique_violation" {
				c.JSON(http.StatusConflict, gin.H{"error": "Пользователь с таким email уже существует"})
				return
			}
			log.Printf("Ошибка при сохранении пользователя: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		//  Если  регистрация  прошла  успешно,  то  userID  будет  установлен
		if userID == 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Пользователь с таким email уже существует"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Пользователь успешно зарегистрирован",
			"user_id": userID,
		})
	}
}

// isValidEmail - функция для проверки валидности email
func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}
