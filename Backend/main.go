package main

import (
	"log"
	"os"

	"mousespa-backend/database"
	"mousespa-backend/models"
	"mousespa-backend/route"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Inisialisasi database
	database.InitDB()

	// Auto-migrate tabel
	if err := database.GetDB().AutoMigrate(&models.Order{}); err != nil {
		log.Fatal("Gagal melakukan migrasi database:", err)
	}
	log.Println("Migrasi database berhasil!")

	// Setup Gin router
	router := gin.Default()

	// Setup CORS - mengizinkan semua origins untuk development
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve static files (Frontend)
	router.Static("/assets", "./static/assets")
	router.StaticFile("/", "./static/index.html")
	router.StaticFile("/index.html", "./static/index.html")
	router.StaticFile("/index.css", "./static/index.css")
	router.StaticFile("/index.js", "./static/index.js")
	
	// Admin page
	router.StaticFile("/admin", "./static/admin.html")
	router.StaticFile("/admin.html", "./static/admin.html")
	router.StaticFile("/admin.css", "./static/admin.css")
	router.StaticFile("/admin.js", "./static/admin.js")

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "MouseSpa Backend is running!",
		})
	})

	// Setup API routes
	api := router.Group("/api")
	route.SetupOrderRoutes(api)

	// Get port from environment variable (for Railway) or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Println("🐭 MouseSpa Backend berjalan di port:", port)
	log.Println("📝 API Endpoints:")
	log.Println("   POST   /api/orders           - Buat order baru")
	log.Println("   GET    /api/orders           - Lihat semua orders")
	log.Println("   GET    /api/orders/:id       - Lihat order by ID")
	log.Println("   DELETE /api/orders/:id       - Hapus order")
	log.Println("   PUT    /api/orders/:id/status - Update status order")
	log.Println("   GET    /api/orders/track/:id - Track order (customer)")
	log.Println("🌐 Frontend tersedia di /")
	log.Println("🔧 Admin tersedia di /admin")

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Gagal menjalankan server:", err)
	}
}
