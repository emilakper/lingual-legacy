package api

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
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
			&user.ID, &user.Email, &user.Password, &user.IsAdmin, &user.CreatedAt,
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

// Middleware для проверки JWT
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем токен из заголовка Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Отсутствует заголовок Authorization"})
			return
		}

		// Токен должен быть в формате "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)

		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверный формат токена"})
			return
		}

		// Парсинг и валидация JWT
		token, err := jwt.Parse(parts[1], func(token *jwt.Token) (interface{}, error) {
			// Проверяем алгоритм подписи
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("неожиданный метод подписи: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверный или просроченный токен"})
			return
		}

		// Проверяем claims и устанавливаем ID пользователя в контекст Gin
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userIDStr, ok := claims["sub"].(string)
			if !ok {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Неверный  формат  ID  пользователя  в  токене"})
				return
			}
			userID, err := strconv.ParseInt(userIDStr, 10, 64)

			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке токена"})
				fmt.Println(err)
				return
			}
			// Устанавливаем ID пользователя в контекст Gin
			c.Set("user_id", userID)
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверный или просроченный токен"})
			return
		}

		// Если  всё  в  порядке,  продолжаем  выполнение  запроса
		c.Next()
	}
}

// GetUser - обработчик для GET /api/v1/users/me
func GetUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем ID пользователя из контекста Gin
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении ID пользователя"})
			return
		}

		// Преобразуем  ID  в  int64
		userIDInt, ok := userID.(int64)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при  преобразовании ID пользователя"})
			return
		}

		// Получение  данных  пользователя  из  базы  данных
		var user models.User
		err := db.QueryRow("SELECT * FROM users WHERE id = $1", userIDInt).Scan(
			&user.ID, &user.Email, &user.Password, &user.IsAdmin, &user.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
				return
			}
			log.Printf("Ошибка  при  получении  пользователя:  %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка  сервера"})
			return
		}

		// Отправка данных пользователя в ответе
		c.JSON(http.StatusOK, user)
	}
}
