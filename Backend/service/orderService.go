package service

import (
	"mousespa-backend/database"
	"mousespa-backend/models"
)

// CreateOrder menyimpan order baru ke database
func CreateOrder(order *models.Order) error {
	result := database.GetDB().Create(order)
	return result.Error
}

// GetAllOrders mengambil semua orders dari database
func GetAllOrders() ([]models.Order, error) {
	var orders []models.Order
	result := database.GetDB().Order("created_at DESC").Find(&orders)
	return orders, result.Error
}

// GetOrderByID mengambil order berdasarkan ID
func GetOrderByID(id uint) (*models.Order, error) {
	var order models.Order
	result := database.GetDB().First(&order, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &order, nil
}

// DeleteOrder menghapus order berdasarkan ID
func DeleteOrder(id uint) error {
	result := database.GetDB().Delete(&models.Order{}, id)
	return result.Error
}

// UpdateOrderStatus mengupdate status order
func UpdateOrderStatus(id uint, status string) error {
	result := database.GetDB().Model(&models.Order{}).Where("id = ?", id).Update("status", status)
	return result.Error
}

// GetOrderForTracking mengambil order untuk tracking customer
func GetOrderForTracking(id uint) (*models.Order, error) {
	var order models.Order
	result := database.GetDB().Select("id", "status", "nama_lengkap", "layanan", "jumlah_mousepad", "created_at", "updated_at").First(&order, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &order, nil
}
