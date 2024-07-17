package api

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	"ling-leg-back/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// Секретный ключ для подписи токенов
var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

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

// LoginUser - обработчик для POST /api/v1/auth/login
func LoginUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение данных для входа из запроса
		var credentials struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&credentials); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат JSON"})
			return
		}

		// 2. Поиск пользователя по email
		var user models.User
		err := db.QueryRow("SELECT * FROM users WHERE email = $1", credentials.Email).Scan(
			&user.ID, &user.Email, &user.Password, &user.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
				return
			}
			log.Printf("Ошибка при поиске пользователя: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 3. Сравнение хэшей паролей
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
			return
		}

		// 4. Генерация JWT-токена
		expirationTime := time.Now().Add(24 * time.Hour) // Время жизни токена - 24 часа
		claims := &jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Subject:   strconv.FormatInt(user.ID, 10),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при генерации токена"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Вход выполнен успешно",
			"token":   tokenString,
		})
	}
}
