package models

import (
	"time"
)

// Order merepresentasikan data pesanan pencucian mousepad
type Order struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Status            string    `gorm:"default:'pending'" json:"status"`
	NamaLengkap       string    `gorm:"not null" json:"nama_lengkap" binding:"required"`
	NomorTelepon      string    `gorm:"not null" json:"nomor_telepon" binding:"required"`
	Email             string    `gorm:"not null" json:"email" binding:"required,email"`
	Layanan           string    `gorm:"not null" json:"layanan" binding:"required"` // JSON string untuk menyimpan array layanan
	JumlahMousepad    int       `gorm:"not null" json:"jumlah_mousepad" binding:"required,min=1"`
	MetodePengambilan string    `gorm:"not null" json:"metode_pengambilan" binding:"required"`
	AlamatPickup      string    `json:"alamat_pickup"`
	CatatanTambahan   string    `json:"catatan_tambahan"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// OrderInput untuk menerima input dari frontend dengan layanan sebagai array
type OrderInput struct {
	NamaLengkap       string   `json:"nama_lengkap" binding:"required"`
	NomorTelepon      string   `json:"nomor_telepon" binding:"required"`
	Email             string   `json:"email" binding:"required,email"`
	Layanan           []string `json:"layanan" binding:"required"`
	JumlahMousepad    int      `json:"jumlah_mousepad" binding:"required,min=1"`
	MetodePengambilan string   `json:"metode_pengambilan" binding:"required"`
	AlamatPickup      string   `json:"alamat_pickup"`
	CatatanTambahan   string   `json:"catatan_tambahan"`
}
