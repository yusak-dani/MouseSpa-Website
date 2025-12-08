package main

import (
	"encoding/json"
	"log"

	"mousespa-backend/database"
	"mousespa-backend/models"
)

// SampleOrders berisi data seed untuk testing
var SampleOrders = []models.OrderInput{
	{
		NamaLengkap:       "Budi Santoso",
		NomorTelepon:      "081234567890",
		Email:             "budi.santoso@gmail.com",
		Layanan:           []string{"Deep Clean", "Anti-bacterial"},
		JumlahMousepad:    2,
		MetodePengambilan: "pickup",
		AlamatPickup:      "Jl. Sudirman No. 123, Jakarta Selatan",
		CatatanTambahan:   "Mousepad gaming ukuran XL",
	},
	{
		NamaLengkap:       "Siti Rahayu",
		NomorTelepon:      "087654321098",
		Email:             "siti.rahayu@yahoo.com",
		Layanan:           []string{"Standard Clean"},
		JumlahMousepad:    1,
		MetodePengambilan: "drop_off",
		AlamatPickup:      "",
		CatatanTambahan:   "",
	},
	{
		NamaLengkap:       "Ahmad Wijaya",
		NomorTelepon:      "082112345678",
		Email:             "ahmad.wijaya@outlook.com",
		Layanan:           []string{"Deep Clean", "Stain Removal", "Deodorizer"},
		JumlahMousepad:    3,
		MetodePengambilan: "pickup",
		AlamatPickup:      "Jl. Gatot Subroto No. 456, Bandung",
		CatatanTambahan:   "Ada noda kopi yang membandel",
	},
	{
		NamaLengkap:       "Dewi Lestari",
		NomorTelepon:      "089876543210",
		Email:             "dewi.lestari@gmail.com",
		Layanan:           []string{"Express Clean"},
		JumlahMousepad:    1,
		MetodePengambilan: "cod",
		AlamatPickup:      "Jl. Diponegoro No. 789, Surabaya",
		CatatanTambahan:   "Butuh cepat, maksimal 2 hari",
	},
	{
		NamaLengkap:       "Reza Pratama",
		NomorTelepon:      "081398765432",
		Email:             "reza.pratama@hotmail.com",
		Layanan:           []string{"Deep Clean", "Anti-bacterial", "UV Sanitization"},
		JumlahMousepad:    5,
		MetodePengambilan: "pickup",
		AlamatPickup:      "Jl. Thamrin No. 321, Jakarta Pusat",
		CatatanTambahan:   "Untuk warnet, perlu invoice",
	},
}

func main() {
	// Inisialisasi database
	database.InitDB()

	// Auto-migrate
	if err := database.GetDB().AutoMigrate(&models.Order{}); err != nil {
		log.Fatal("Gagal migrasi database:", err)
	}

	// Cek apakah sudah ada data
	var count int64
	database.GetDB().Model(&models.Order{}).Count(&count)

	if count > 0 {
		log.Printf("Database sudah memiliki %d order. Skip seeding.", count)
		return
	}

	// Insert sample data
	log.Println("🌱 Memulai seeding database...")

	for _, input := range SampleOrders {
		// Convert layanan array ke JSON string
		layananJSON, _ := json.Marshal(input.Layanan)

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

		if err := database.GetDB().Create(&order).Error; err != nil {
			log.Printf("❌ Gagal insert order untuk %s: %v", input.NamaLengkap, err)
		} else {
			log.Printf("✅ Order berhasil dibuat: %s (%s)", input.NamaLengkap, input.Email)
		}
	}

	log.Println("🎉 Seeding selesai!")
	log.Printf("📊 Total orders: %d", len(SampleOrders))
}
