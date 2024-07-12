package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// Простой маршрут для проверки связи
	router.GET("/api/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Привет от Go бэкенда!",
		})
	})

	fmt.Println("Сервер запущен на http://localhost:8080")
	router.Run(":8080")
}
