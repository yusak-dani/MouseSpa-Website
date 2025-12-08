package route

import (
	"encoding/json"
	"net/http"
	"strconv"

	"mousespa-backend/models"
	"mousespa-backend/service"

	"github.com/gin-gonic/gin"
)

// SetupOrderRoutes mendaftarkan semua route untuk orders
func SetupOrderRoutes(router *gin.RouterGroup) {
	orders := router.Group("/orders")
	{
		orders.POST("", createOrder)
		orders.GET("", getAllOrders)
		orders.GET("/:id", getOrderByID)
		orders.DELETE("/:id", deleteOrder)
	}
}

// createOrder handler untuk POST /api/orders
func createOrder(c *gin.Context) {
	var input models.OrderInput

	// Bind JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	// Convert layanan array ke JSON string
	layananJSON, err := json.Marshal(input.Layanan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memproses data layanan",
		})
		return
	}

	// Buat order baru
	order := models.Order{
		NamaLengkap:       input.NamaLengkap,
		NomorTelepon:      input.NomorTelepon,
		Email:             input.Email,
		Layanan:           string(layananJSON),
		JumlahMousepad:    input.JumlahMousepad,
		MetodePengambilan: input.MetodePengambilan,
		AlamatPickup:      input.AlamatPickup,
		CatatanTambahan:   input.CatatanTambahan,
	}

	// Simpan ke database
	if err := service.CreateOrder(&order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan order",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Order berhasil dibuat",
		"data":    order,
	})
}

// getAllOrders handler untuk GET /api/orders
func getAllOrders(c *gin.Context) {
	orders, err := service.GetAllOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data orders",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data orders berhasil diambil",
		"data":    orders,
		"total":   len(orders),
	})
}

// getOrderByID handler untuk GET /api/orders/:id
func getOrderByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID tidak valid",
		})
		return
	}

	order, err := service.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Order tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order ditemukan",
		"data":    order,
	})
}

// deleteOrder handler untuk DELETE /api/orders/:id
func deleteOrder(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID tidak valid",
		})
		return
	}

	if err := service.DeleteOrder(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menghapus order",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order berhasil dihapus",
	})
}
