package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Config untuk koneksi database MySQL
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// GetConfig mengambil konfigurasi dari environment variables atau default
// Supports Railway MySQL plugin vars (MYSQL*) and custom vars (DB_*)
func GetConfig() Config {
	return Config{
		Host:     getEnvWithFallback([]string{"MYSQLHOST", "DB_HOST"}, "localhost"),
		Port:     getEnvWithFallback([]string{"MYSQLPORT", "DB_PORT"}, "3306"),
		User:     getEnvWithFallback([]string{"MYSQLUSER", "DB_USER"}, "root"),
		Password: getEnvWithFallback([]string{"MYSQLPASSWORD", "DB_PASSWORD"}, ""),
		DBName:   getEnvWithFallback([]string{"MYSQLDATABASE", "DB_NAME"}, "mousespa"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvWithFallback tries multiple env var names and returns first found or default
func getEnvWithFallback(keys []string, defaultValue string) string {
	for _, key := range keys {
		if value := os.Getenv(key); value != "" {
			log.Printf("Found env var %s = %s", key, maskValue(value))
			return value
		}
	}
	log.Printf("No env var found for %v, using default: %s", keys, defaultValue)
	return defaultValue
}

// maskValue masks sensitive values for logging
func maskValue(value string) string {
	if len(value) <= 4 {
		return "****"
	}
	return value[:2] + "****" + value[len(value)-2:]
}

// InitDB menginisialisasi koneksi database MySQL
func InitDB() {
	// Check for MYSQL_URL first (Railway provides this)
	mysqlURL := os.Getenv("MYSQL_URL")
	if mysqlURL != "" {
		log.Println("Using MYSQL_URL for database connection")
		var err error
		DB, err = gorm.Open(mysql.Open(mysqlURL), &gorm.Config{})
		if err != nil {
			log.Fatal("Gagal koneksi ke database MySQL via URL:", err)
		}
		log.Println("Database MySQL berhasil terkoneksi via URL!")
		return
	}

	// Fallback to individual config
	config := GetConfig()

	log.Printf("Attempting to connect to MySQL at %s:%s", config.Host, config.Port)

	// Format DSN: user:password@tcp(host:port)/dbname?charset=utf8mb4&parseTime=True&loc=Local
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database MySQL:", err)
	}
	log.Printf("Database MySQL berhasil terkoneksi! (Host: %s, DB: %s)", config.Host, config.DBName)
}

// GetDB mengembalikan instance database
func GetDB() *gorm.DB {
	return DB
}

